import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import Product from '../models/Product';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router: Router = Router();

// Helper to format file paths for frontend
const formatFileUrl = (req: Request, filename: string) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// GET all products
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, grade } = req.query;
    const whereClause: any = {};
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }
    if (category) {
      whereClause.category = category;
    }
    if (grade) {
      whereClause.grade = grade;
    }
    const products = await Product.findAll({ where: whereClause });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET single product
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST create product (Admin)
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  upload.array('media'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      const mediaUrls = files ? files.map(f => formatFileUrl(req, f.filename)) : [];

      const product = await Product.create({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        grade: req.body.grade || 'Toy-Grade',
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock),
        media: mediaUrls
      });
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }
);

// PUT update product (Admin)
router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  upload.array('media'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const mediaUrls = files ? files.map(f => formatFileUrl(req, f.filename)) : [];

      await product.update({
        name: req.body.name || product.name,
        description: req.body.description || product.description,
        category: req.body.category || product.category,
        grade: req.body.grade || product.grade,
        price: req.body.price ? parseFloat(req.body.price) : product.price,
        stock: req.body.stock ? parseInt(req.body.stock) : product.stock,
        media: mediaUrls.length > 0 ? mediaUrls : product.media
      });

      res.json(product);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }
);

// DELETE product (Admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
