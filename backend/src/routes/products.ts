import { Router, Request, Response } from 'express';
import Product from '../models/Product';

const router: Router = Router();

// GET all products
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// POST create product (Admin)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      imageUrl: req.body.imageUrl,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

export default router;
