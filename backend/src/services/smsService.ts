import dotenv from 'dotenv';
dotenv.config();

export interface OrderSMSDetails {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  city?: string;
  itemsCount?: number;
}

/**
 * Service to dispatch SMS notifications to the Admin phone number when a customer confirms an order.
 */
export const sendAdminOrderSMS = async (details: OrderSMSDetails): Promise<void> => {
  const adminPhone = process.env.ADMIN_PHONE_NUMBER || '9876543210';
  const message = `🔔 PlaycastHub New Order Alert!
Order #${details.orderNumber} placed by ${details.customerName} (Phone: ${details.customerPhone}).
Total: ₹${details.totalAmount.toFixed(2)}${details.city ? ` | City: ${details.city}` : ''}.
Support Team: Please contact customer to confirm delivery schedule.`;

  console.log(`\n================== [SMS NOTIFICATION TO ADMIN] ==================`);
  console.log(`Admin Recipient Phone: ${adminPhone}`);
  console.log(`Message Body:\n${message}`);
  console.log(`=================================================================\n`);

  // 1. Support for Twilio SMS if configured in .env
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuth && twilioPhone) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', adminPhone.startsWith('+') ? adminPhone : `+91${adminPhone}`);
      params.append('From', twilioPhone);
      params.append('Body', message);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      const data: any = await res.json();
      console.log('[SMS Provider: Twilio] Dispatched successfully:', data?.sid);
      return;
    } catch (err) {
      console.error('[SMS Provider: Twilio] Error sending SMS:', err);
    }
  }

  // 2. Support for Fast2SMS (Indian SMS Gateway) if configured
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message,
          flash: 0,
          numbers: adminPhone.replace(/[^0-9]/g, '').slice(-10),
        }),
      });
      const data = await res.json();
      console.log('[SMS Provider: Fast2SMS] Response:', data);
      return;
    } catch (err) {
      console.error('[SMS Provider: Fast2SMS] Error:', err);
    }
  }

  // 3. Generic SMS Gateway Webhook if configured
  const genericSmsWebhook = process.env.SMS_WEBHOOK_URL;
  if (genericSmsWebhook) {
    try {
      await fetch(genericSmsWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminPhone,
          message,
          order: details,
        }),
      });
      console.log('[SMS Provider: Webhook] Dispatched successfully');
      return;
    } catch (err) {
      console.error('[SMS Provider: Webhook] Error:', err);
    }
  }

  console.log('[SMS Service] SMS logged to console. Configure ADMIN_PHONE_NUMBER and SMS credentials in .env to deliver real SMS.');
};

export default {
  sendAdminOrderSMS,
};
