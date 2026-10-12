const { sendTransactionalEmail } = require('../services/emailService');

/**
 * Controller to simulate sending an order confirmation email via SendGrid
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const sendOrderConfirmation = async (req, res) => {
  try {
    const { email, customerName, orderNumber, totalAmount } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required.',
      });
    }

    const orderId = orderNumber || `ORD-${Date.now()}`;
    const name = customerName || 'Customer';
    const amount = totalAmount || '0.00';

    const subject = `Order Confirmation #${orderId} - PlaycastHub`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0284c7;">PlaycastHub</h2>
        <h3>Hello ${name},</h3>
        <p>Thank you for your order! Your order <strong>#${orderId}</strong> has been successfully placed.</p>
        <p><strong>Total Amount:</strong> ₹${amount}</p>
        <p>We are getting your items ready for shipment!</p>
      </div>
    `;
    const text = `Hello ${name}, Thank you for your order! Your order #${orderId} for ₹${amount} has been placed.`;

    // Invoke the reusable SendGrid service
    const response = await sendTransactionalEmail({
      to: email,
      subject,
      text,
      html,
    });

    return res.status(200).json({
      success: true,
      message: 'Order confirmation email sent successfully.',
      data: response,
    });
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: Failed to send email.',
      error: error.message,
    });
  }
};

module.exports = {
  sendOrderConfirmation,
};
