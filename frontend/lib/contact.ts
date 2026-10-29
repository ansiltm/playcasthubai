export const SHOP_PHONE = '+918907792898';
export const SHOP_PHONE_DISPLAY = '+91 89077 92898';
export const SHOP_WHATSAPP = 'https://wa.me/918907792898';
export function orderWhatsAppLink(orderNumber: string): string {
  const message = 'Hi PlayCastHub, I placed order #' + orderNumber + '. Please confirm availability, the final total including delivery, and payment instructions. Thank you.';
  return SHOP_WHATSAPP + '?text=' + encodeURIComponent(message);
}
