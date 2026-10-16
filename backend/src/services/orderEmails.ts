import { sendTransactionalEmail } from './emailService';
import { escapeHtml as e } from '../utils/validation';
export async function sendOrderEmails(order: any, update = false): Promise<void> {
  const details = `<h2>PlayCastHub</h2><p>Order <strong>${e(order.orderNumber)}</strong></p><p>Status: ${e(order.status)}</p><p>Total: ₹${Number(order.totalAmount).toFixed(2)}</p><ul>${order.OrderItems.map((i: any) => `<li>${e(i.name)} × ${i.quantity}</li>`).join('')}</ul>`;
  const messages = [];
  if (order.customerEmail) messages.push(sendTransactionalEmail({ to: order.customerEmail, subject: `PlayCastHub order ${update ? 'update' : 'received'}: ${order.orderNumber}`, html: `${details}<p>${update ? 'Your order status has changed.' : 'We have received your order. Our team will confirm delivery details before dispatch.'}</p>` }));
  if (!update && process.env.ADMIN_NOTIFICATION_EMAIL) messages.push(sendTransactionalEmail({ to: process.env.ADMIN_NOTIFICATION_EMAIL, subject: `New order: ${order.orderNumber}`, html: `${details}<p>${e(order.customerName)} · ${e(order.customerPhone)}</p><p>Open the admin dashboard for delivery details.</p>` }));
  const results = await Promise.allSettled(messages);
  if (results.some(r => r.status === 'rejected')) console.error('An order email was not delivered. The order is saved in the dashboard.');
}
