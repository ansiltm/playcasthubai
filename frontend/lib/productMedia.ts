export type MediaProduct = { imageUrl?: string; media?: string[] };

export function isVideoMedia(url = '') {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url) ||
    (url.includes('/video/upload/') && !/\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(url));
}

// Stock photography is inspiration, not a photograph of the SKU being sold.
export function productMedia(product: MediaProduct): string[] {
  return [...new Set([...(product.media || []), product.imageUrl || ''])]
    .filter(url => Boolean(url) && !url.includes('images.unsplash.com'));
}

export function videoPoster(url: string) {
  if (!url.includes('res.cloudinary.com/') || !url.includes('/video/upload/')) return undefined;
  return url.replace('/video/upload/', '/video/upload/so_0,f_jpg,q_auto,w_800/')
    .replace(/\.[^/.?]+(\?.*)?$/, '.jpg');
}

export function productCover(product: MediaProduct): string | undefined {
  const media = productMedia(product);
  return media.find(url => !isVideoMedia(url)) || (media[0] ? videoPoster(media[0]) : undefined);
}
