import { Router } from 'express';
import { Product } from '../models';
import { authenticate, authorizeAdmin, optionalAuthenticate } from '../middleware/auth';
import { upload, uploadToCloudinary } from '../middleware/upload';
import { asyncRoute } from '../utils/http';
import * as v from '../utils/validation';
const router = Router();
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const list = asyncRoute(async (req, res) => {
  const search = v.text(req.query.search || req.query.q || '', 'search', 100, false);
  const filter: any = {};
  if (search) filter.$or = ['name','description','category'].map(field => ({ [field]: new RegExp(escapeRegex(search), 'i') }));
  for (const field of ['category','grade','ageLabel']) {
    if (req.query[field]) filter[field] = new RegExp(`^${escapeRegex(v.text(req.query[field], field, 100))}$`, 'i');
  }
  if (req.query.inStock === 'true') filter.stock = { $gt: 0 };
  const sortKey = ['price','name','createdAt'].includes(req.query.sort) ? req.query.sort : 'createdAt';
  const direction = req.query.order === 'asc' ? 1 : -1;
  let query = Product.find(filter).sort({ [sortKey]: direction, _id: direction });
  if (req.path === '/trending') query = query.limit(6);
  if (req.user?.role !== 'admin') query = query.select('-wholesalePrice');
  res.json(await query);
});
router.get('/trending', optionalAuthenticate, list);
router.get('/search', optionalAuthenticate, list);
router.get('/', optionalAuthenticate, list);
router.get('/:id', optionalAuthenticate, asyncRoute(async (req, res) => {
  let query = Product.findById(v.objectId(req.params.id));
  if (req.user?.role !== 'admin') query = query.select('-wholesalePrice');
  const product = await query;
  if (!product) throw new v.HttpError(404, 'Product not found.');
  res.json(product);
}));
function mediaUrl(value: unknown): string {
  const url = v.text(value, 'media URL', 1500);
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && parsed.hostname) return url;
  } catch {}
  throw new v.HttpError(400, 'Media URLs must use valid HTTPS links.');
}
async function productData(req: any, product?: any) {
  const data: any = {};
  for (const [field, max] of [['name',150],['description',5000],['category',100],['grade',100]] as [string, number][]) {
    if (!product || req.body[field] !== undefined) data[field] = v.text(req.body[field], field, max);
  }
  for (const field of ['price','wholesalePrice']) {
    if (!product || req.body[field] !== undefined) data[field] = v.money(Number(req.body[field] || 0));
  }
  if (!product || req.body.stock !== undefined) {
    const stock = Number(req.body.stock);
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 100000) throw new v.HttpError(400, 'Stock must be a whole number from 0 to 100000.');
    data.stock = stock;
  }
  if (req.body.ageLabel !== undefined) {
    if (!['Not specified','3+','6+','8+','14+','18+'].includes(req.body.ageLabel)) throw new v.HttpError(400, 'Choose a valid age recommendation.');
    data.ageLabel = req.body.ageLabel;
  }
  if (req.body.safetyNotes !== undefined) data.safetyNotes = v.text(req.body.safetyNotes, 'safety notes', 1000, false);
  if (req.body.colors !== undefined) {
    let colorsList: string[] = [];
    if (Array.isArray(req.body.colors)) {
      colorsList = req.body.colors.map((c: any) => v.text(c, 'color', 40));
    } else if (typeof req.body.colors === 'string') {
      try {
        const parsed = JSON.parse(req.body.colors);
        if (Array.isArray(parsed)) colorsList = parsed.map((c: any) => v.text(c, 'color', 40));
        else colorsList = req.body.colors.split(',').map((c: string) => c.trim()).filter(Boolean);
      } catch {
        colorsList = req.body.colors.split(',').map((c: string) => c.trim()).filter(Boolean);
      }
    }
    data.colors = colorsList.slice(0, 10);
  }

  // All uploaded files (general media + per-color files)
  const allFiles = (req.files || []) as Express.Multer.File[];

  // ── General media ─────────────────────────────────────────────────────────
  const generalFiles = allFiles.filter(f => f.fieldname === 'media');
  let media: string[] = product?.media || [];
  if (!product || req.body.mediaUpdated === 'true' || req.body.existingMedia !== undefined) {
    media = req.body.existingMedia
      ? (Array.isArray(req.body.existingMedia) ? req.body.existingMedia : [req.body.existingMedia]).map(mediaUrl)
      : [];
  }
  if (media.length + generalFiles.length > 8) throw new v.HttpError(400, 'Use no more than 8 media files per product.');
  // Serial uploads avoid multiplying memory usage on the free server.
  for (const file of generalFiles) media.push(await uploadToCloudinary(file));
  data.media = media;
  data.imageUrl = media.find(url => !url.includes('/video/upload/')) || '';

  // ── Per-color media ───────────────────────────────────────────────────────
  // colorMediaColors = JSON array of color names, one per index
  // colorMedia_{idx} = uploaded files for that color
  // colorMediaExisting_{idx} = existing saved URLs for that color (to keep)
  if (req.body.colorMediaColors !== undefined) {
    let colorNames: string[] = [];
    try { colorNames = JSON.parse(req.body.colorMediaColors); } catch {}
    const colorMediaResult: Array<{ color: string; media: string[] }> = [];
    for (let idx = 0; idx < colorNames.length; idx++) {
      const color = colorNames[idx];
      if (!color) continue;
      // Existing saved URLs
      const existingField = `colorMediaExisting_${idx}`;
      let urls: string[] = [];
      if (req.body[existingField]) {
        const raw = req.body[existingField];
        urls = (Array.isArray(raw) ? raw : [raw]).map(mediaUrl);
      }
      // Newly uploaded files for this color
      const colorFiles = allFiles.filter(f => f.fieldname === `colorMedia_${idx}`);
      if (urls.length + colorFiles.length > 8) throw new v.HttpError(400, `Color "${color}" has too many media files (max 8).`);
      for (const file of colorFiles) urls.push(await uploadToCloudinary(file));
      // Always include the entry so empty color-media is persisted (clears old data)
      colorMediaResult.push({ color: v.text(color, 'color', 40), media: urls.slice(0, 8) });
    }
    data.colorMedia = colorMediaResult;
  } else if (req.body.colorMedia !== undefined) {
    try {
      const parsed = typeof req.body.colorMedia === 'string'
        ? JSON.parse(req.body.colorMedia)
        : req.body.colorMedia;
      if (Array.isArray(parsed)) {
        data.colorMedia = parsed
          .filter((cm: any) => cm && cm.color)
          .map((cm: any) => ({
            color: v.text(cm.color, 'color', 40),
            media: Array.isArray(cm.media)
              ? cm.media.map((u: unknown) => mediaUrl(u)).slice(0, 8)
              : [],
          }))
          .slice(0, 10);
      }
    } catch { /* ignore malformed */ }
  }

  return data;
}
// Use upload.any() so multer accepts both 'media' and per-color 'colorMedia_{idx}' fields
router.post('/', authenticate, authorizeAdmin, upload.any(), asyncRoute(async (req, res) => res.status(201).json(await Product.create(await productData(req)))));
router.put('/:id', authenticate, authorizeAdmin, upload.any(), asyncRoute(async (req, res) => {
  const id = v.objectId(req.params.id);
  const product = await Product.findById(id);
  if (!product) throw new v.HttpError(404, 'Product not found.');
  const data = await productData(req, product);
  // Compare the observed stock if the admin is changing it, so a concurrent checkout isn't overwritten.
  const condition: any = { _id: id, updatedAt: product.updatedAt };
  const updated = await Product.findOneAndUpdate(condition, { $set: data }, { new: true, runValidators: true });
  if (!updated) throw new v.HttpError(409, 'This product changed while you edited it. Refresh and try again.');
  res.json(updated);
}));
router.delete('/:id', authenticate, authorizeAdmin, asyncRoute(async (req, res) => {
  // Orders retain a snapshot of deleted product details.
  const product = await Product.findByIdAndDelete(v.objectId(req.params.id));
  if (!product) throw new v.HttpError(404, 'Product not found.');
  res.json({ message: 'Product deleted. Existing orders keep their saved product details.' });
}));
export default router;
