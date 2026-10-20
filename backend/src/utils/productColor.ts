import { HttpError } from './validation';

export function resolveProductColor(product: any, requested: string, manual = false): string {
  const colors: string[] = product.colors?.length ? product.colors : (product.colorMedia || []).map((entry: any) => entry.color).filter(Boolean);
  if (!requested) {
    if (!manual && colors.length) throw new HttpError(400, `Choose a colour for ${product.name}.`);
    return '';
  }
  const match = colors.find(color => color.trim().toLowerCase() === requested.trim().toLowerCase());
  if (!match) throw new HttpError(400, `The selected colour for ${product.name} is no longer available. Please update your cart.`);
  return match;
}
