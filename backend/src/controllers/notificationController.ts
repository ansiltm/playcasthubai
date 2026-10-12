import { Request, Response } from 'express';
import { sendTransactionalEmail } from '../services/emailService';

/**
 * Controller to send an order confirmation notification email
 * @route POST /api/notifications/order-confirmation
 */
export const sendOrderConfirmationNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, customerName, orderNumber, totalAmount, items } = req.body;

    // Validate recipient email
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Recipient email is required',
      });
      return;
    }

    const orderId = orderNumber || `ORD-${Date.now()}`;
    const name = customerName || 'Valued Customer';
    const amount = typeof totalAmount === 'number' ? totalAmount.toFixed(2) : totalAmount || '0.00';

    // Build HTML email template
    const subject = `Order Confirmation - #${orderId} | PlaycastHub`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0284c7; margin-bottom: 8px;">PlaycastHub</h2>
        <h3 style="color: #1e293b;">Thank You for Your Order, ${name}!</h3>
        <p style="color: #475569; font-size: 15px;">Your order <strong>#${orderId}</strong> has been received and is being processed.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #334155;"><strong>Order Number:</strong> #${orderId}</p>
          <p style="margin: 6px 0 0; color: #334155;"><strong>Total Amount:</strong> ₹${amount}</p>
        </div>

        <p style="color: #64748b; font-size: 14px;">We will send another notification once your package is dispatched.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} PlaycastHub. All rights reserved.</p>
      </div>
    `;

    const text = `Thank you for your order, ${name}! Your order #${orderId} for ₹${amount} has been received.`;

    // Trigger SendGrid email
    const result = await sendTransactionalEmail({
      to: email,
      subject,
      text,
      html,
    });

    res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Notification controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send order confirmation email',
      error: error?.message || 'Internal Server Error',
    });
  }
};

export default {
  sendOrderConfirmationNotification,
};
