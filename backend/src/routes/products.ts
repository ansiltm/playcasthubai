import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import Product from '../models/Product';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router: Router = Router();

// GET all products
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category } = req.query;
    const whereClause: any = {};
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }
    if (category) {
      whereClause.category = category;
    }
    const products = await Product.findAll({ where: whereClause });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST create product (Admin)
router.post('/', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      imageUrl: req.body.imageUrl,
      images: req.body.images,
      videoUrl: req.body.videoUrl,
      model3dUrl: req.body.model3dUrl,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

export default router;
