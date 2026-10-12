import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

export interface AdminOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface AdminOrderAlertParams {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalAmount: number;
  shippingAddress: {
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
  };
  items: AdminOrderItem[];
}

/**
 * Sends an Order Notification Email to the Admin whenever a customer confirms an order.
 */
export const sendAdminOrderEmailAlert = async (params: AdminOrderAlertParams): Promise<void> => {
  const toEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@playcasthub.com';
  const fromEmail = process.env.ADMIN_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'orders@playcasthub.com';

  const addressText = [
    params.shippingAddress.addressLine1,
    params.shippingAddress.addressLine2,
    params.shippingAddress.city,
    params.shippingAddress.state,
    params.shippingAddress.pincode ? `- ${params.shippingAddress.pincode}` : '',
  ].filter(Boolean).join(', ') || 'N/A';

  const itemsHtml = params.items.map(item => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${item.name}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-weight: bold; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const subject = `🚨 New Order Alert: #${params.orderNumber} - ₹${params.totalAmount.toFixed(2)} (${params.customerName})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff;">
      <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #0284c7; margin: 0 0 6px 0;">PlaycastHub Admin</h2>
        <span style="background-color: #ecfeff; color: #0e7490; font-size: 13px; font-weight: bold; padding: 4px 10px; border-radius: 6px;">New Customer Order Confirmed</span>
      </div>

      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 18px;">Order Details (#${params.orderNumber})</h3>
        <p style="margin: 4px 0; color: #334155;"><strong>Customer Name:</strong> ${params.customerName}</p>
        <p style="margin: 4px 0; color: #334155;"><strong>Contact Phone:</strong> <a href="tel:${params.customerPhone}" style="color: #0284c7; font-weight: bold; text-decoration: none;">${params.customerPhone} (Click to Call)</a></p>
        ${params.customerEmail ? `<p style="margin: 4px 0; color: #334155;"><strong>Customer Email:</strong> ${params.customerEmail}</p>` : ''}
        <p style="margin: 4px 0; color: #334155;"><strong>Delivery Address:</strong> ${addressText}</p>
        <p style="margin: 4px 0; color: #059669; font-weight: bold; font-size: 16px;"><strong>Total Amount:</strong> ₹${params.totalAmount.toFixed(2)}</p>
      </div>

      <h4 style="color: #334155; margin: 16px 0 8px 0;">Items Ordered:</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="padding: 10px 12px; text-align: left; color: #475569;">Item</th>
            <th style="padding: 10px 12px; text-align: center; color: #475569;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; color: #475569;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 14px; border-radius: 8px; font-size: 13px; line-height: 1.5;">
        <strong>📞 Action Required:</strong> Please contact the customer at <strong><a href="tel:${params.customerPhone}" style="color: #b45309;">${params.customerPhone}</a></strong> to confirm the order details and dispatch timing.
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 12px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">PlaycastHub Store Automation</p>
    </div>
  `;

  const text = `NEW ORDER ALERT (#${params.orderNumber})
Customer: ${params.customerName}
Phone: ${params.customerPhone}
Address: ${addressText}
Total: ₹${params.totalAmount.toFixed(2)}
Please contact the customer to confirm delivery.`;

  console.log(`\n================== [ADMIN ORDER EMAIL ALERT] ==================`);
  console.log(`To Admin: ${toEmail}`);
  console.log(`From: ${fromEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Customer: ${params.customerName} | Phone: ${params.customerPhone}`);
  console.log(`Total: ₹${params.totalAmount.toFixed(2)} | Address: ${addressText}`);
  console.log(`================================================================\n`);

  // 1. Try Gmail / SMTP Nodemailer if configured
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass) {
    try {
      const cleanPass = smtpPass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'PlaycastHub Store'}" <${fromEmail}>`,
        to: toEmail,
        subject,
        text,
        html,
      });
      console.log(`[Admin Alert] Email successfully dispatched to admin via Gmail SMTP: ${toEmail} (MessageId: ${info.messageId})`);
      return;
    } catch (err: any) {
      console.error('[Admin Alert: Gmail SMTP Error]:', err?.message || err);
    }
  }

  // 2. Try SendGrid if API key is configured
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey && !sendgridApiKey.includes('your_actual_api_key')) {
    try {
      sgMail.setApiKey(sendgridApiKey);
      await sgMail.send({
        to: toEmail,
        from: fromEmail,
        subject,
        text,
        html,
      });
      console.log(`[Admin Alert] Email successfully dispatched to admin via SendGrid: ${toEmail}`);
      return;
    } catch (err: any) {
      console.error('[Admin Alert: SendGrid Error]:', err?.response?.body || err?.message || err);
    }
  }

  // 3. Fallback: Log to console so no order process ever crashes
  console.log(`[Admin Alert Notice] Order logged. Please configure ADMIN_NOTIFICATION_EMAIL and email credentials in .env to receive live inbox emails.`);
};

export default {
  sendAdminOrderEmailAlert,
};
