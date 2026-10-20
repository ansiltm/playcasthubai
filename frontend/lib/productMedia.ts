export type MediaProduct = { imageUrl?: string; media?: string[]; colors?: string[]; colorMedia?: Array<{ color: string; media: string[] }> };
const colorKey = (value: string) => value.trim().toLowerCase();
const cleanMedia = (values: unknown): string[] => Array.isArray(values)
  ? [...new Set(values.filter((url): url is string => typeof url === 'string' && !!url.trim() && !url.includes('images.unsplash.com')))] : [];

export function productColors(product?: MediaProduct | null): string[] {
  const colors = Array.isArray(product?.colors) ? product.colors : [];
  const entries = Array.isArray(product?.colorMedia) ? product.colorMedia : [];
  return [...new Set((colors.length ? colors : entries.map(entry => entry?.color))
    .filter((color): color is string => typeof color === 'string' && !!color.trim()).map(color => color.trim()))];
}

export function colorHasMedia(product: MediaProduct | null | undefined, color: string): boolean {
  return Array.isArray(product?.colorMedia) && product.colorMedia.some(entry => typeof entry?.color === 'string' && colorKey(entry.color) === colorKey(color) && cleanMedia(entry.media).length > 0);
}

export function isVideoMedia(url = '') {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url) ||
    (url.includes('/video/upload/') && !/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(url));
}

// Stock photography is inspiration, not a photograph of the SKU being sold.
export function productMedia(product?: MediaProduct | null, color?: string): string[] {
  if (!product) return [];
  const variants = Array.isArray(product.colorMedia) ? product.colorMedia : [];
  if (color) {
    const match = variants.find(entry => typeof entry?.color === 'string' && colorKey(entry.color) === colorKey(color));
    const selected = cleanMedia(match?.media);
    if (selected.length) return selected;
  }
  const general = cleanMedia([...(Array.isArray(product.media) ? product.media : []), product.imageUrl]);
  if (general.length || color) return general;
  return variants.map(entry => cleanMedia(entry?.media)).find(media => media.length > 0) || [];
}

export function videoPoster(url: string) {
  if (!url.includes('res.cloudinary.com/') || !url.includes('/video/upload/')) return undefined;
  return url.replace('/video/upload/', '/video/upload/so_0,f_jpg,q_auto,w_800/')
    .replace(/\.[^/.?]+(\?.*)?$/, '.jpg');
}

export function productCover(product?: MediaProduct | null, color?: string): string | undefined {
  const media = productMedia(product, color);
  return media.find(url => !isVideoMedia(url)) || (media[0] ? videoPoster(media[0]) : undefined);
}
