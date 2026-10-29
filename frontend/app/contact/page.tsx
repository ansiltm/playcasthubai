import { SHOP_EMAIL, SHOP_PHONE, SHOP_PHONE_DISPLAY, SHOP_WHATSAPP } from '../../lib/contact';
export default function ContactPage() {
  return <main className="max-w-3xl mx-auto px-4 py-16"><div className="bubble-card p-8">
    <h1 className="text-3xl font-black mb-4">Contact PlayCastHub</h1>
    <p className="text-text-muted mb-6">Need help with an order, delivery charges or payment? Contact us on WhatsApp, by phone or by email. Include your order number so we can help with your purchase.</p>
    <a href={'tel:' + SHOP_PHONE} className="block text-xl font-bold mb-6">{SHOP_PHONE_DISPLAY}</a>
    <div className="mb-6">
      <h2 className="font-bold text-sm text-text-muted mb-2">Email us</h2>
      <a href={'mailto:' + SHOP_EMAIL} className="text-lg font-bold text-primary underline underline-offset-4 break-all">{SHOP_EMAIL}</a>
    </div>
    <a href={SHOP_WHATSAPP} target="_blank" rel="noopener noreferrer" className="bubble-btn">Chat on WhatsApp</a>
    <p className="text-sm text-text-muted mt-6">Orders are saved before WhatsApp opens. We confirm availability, delivery charges and payment instructions in chat. Cash on delivery is currently unavailable.</p>
  </div></main>;
}
