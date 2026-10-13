import { Router, Request, Response } from 'express';
import { Product } from '../models';
import { authenticate, authorizeAdmin, optionalAuthenticate } from '../middleware/auth';
import { upload, uploadToCloudinary } from '../middleware/upload';

const router: Router = Router();

// Helper to format file paths for frontend
const formatFileUrl = (req: Request, filename: string) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// GET trending products - supports dynamic ordering: ?order=asc|desc&sort=createdAt|price|name&limit=6
router.get('/trending', optionalAuthenticate, async (req: any, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const orderParam = req.query.order ? req.query.order.toString().toLowerCase() : 'asc';
    const sortDirection: 1 | -1 = orderParam === 'desc' ? -1 : 1;
    const sortBy = (req.query.sort || req.query.sortBy || 'createdAt') as string;
    const limit = parseInt(req.query.limit as string) || 6;

    let sortObj: any = {};
    if (sortBy === 'price') {
      sortObj = { price: sortDirection };
    } else if (sortBy === 'name') {
      sortObj = { name: sortDirection };
    } else {
      sortObj = { createdAt: sortDirection, _id: sortDirection };
    }

    let query = Product.find().sort(sortObj).limit(limit);
    if (!isAdmin) {
      query = query.select('-wholesalePrice');
    }
    const trendingProducts = await query.exec();
    res.json(trendingProducts);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// Dedicated Search endpoint: GET /api/products/search?q=... or ?search=...
router.get('/search', optionalAuthenticate, async (req: any, res: Response): Promise<void> => {
  try {
    const query = (req.query.q || req.query.search || '') as string;
    const { category, grade } = req.query;
    const filter: any = {};

    if (query && query.trim()) {
      const searchRegex = new RegExp(query.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (grade) {
      filter.grade = grade;
    }

    const isAdmin = req.user && req.user.role === 'admin';
    let mongoQuery = Product.find(filter).sort({ createdAt: -1 });
    if (!isAdmin) {
      mongoQuery = mongoQuery.select('-wholesalePrice');
    }

    const products = await mongoQuery.exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET all products with filtering & search: GET /api/products?search=...
router.get('/', optionalAuthenticate, async (req: any, res: Response): Promise<void> => {
  try {
    const search = (req.query.search || req.query.q || '') as string;
    const { category, grade } = req.query;
    const filter: any = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (grade) {
      filter.grade = grade;
    }

    const isAdmin = req.user && req.user.role === 'admin';
    const orderParam = req.query.order ? req.query.order.toString().toLowerCase() : 'asc';
    const sortDirection: 1 | -1 = orderParam === 'desc' ? -1 : 1;
    const sortBy = (req.query.sort || req.query.sortBy || 'createdAt') as string;
    let sortObj: any = {};
    if (sortBy === 'price') {
      sortObj = { price: sortDirection };
    } else if (sortBy === 'name') {
      sortObj = { name: sortDirection };
    } else {
      sortObj = { createdAt: sortDirection, _id: sortDirection };
    }

    let mongoQuery = Product.find(filter).sort(sortObj);
    if (!isAdmin) {
      mongoQuery = mongoQuery.select('-wholesalePrice');
    }

    const products = await mongoQuery.exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// GET single product
router.get('/:id', optionalAuthenticate, async (req: any, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let query = Product.findById(req.params.id);
    if (!isAdmin) {
      query = query.select('-wholesalePrice');
    }

    const product = await query.exec();
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
  upload.array('media') as any,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      let mediaUrls: string[] = [];
      if (files && files.length > 0) {
        mediaUrls = await Promise.all(files.map(f => uploadToCloudinary(f)));
      }

      let existingMedia: string[] = [];
      if (req.body.existingMedia) {
        if (Array.isArray(req.body.existingMedia)) {
          existingMedia = req.body.existingMedia;
        } else if (typeof req.body.existingMedia === 'string' && req.body.existingMedia.trim() !== '') {
          existingMedia = [req.body.existingMedia];
        }
      }

      const allMedia = [...existingMedia, ...mediaUrls];
      const primaryImage = req.body.imageUrl || allMedia[0] || '';

      const product = await Product.create({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        grade: req.body.grade || 'Toy-Grade',
        price: parseFloat(req.body.price),
        wholesalePrice: req.body.wholesalePrice ? parseFloat(req.body.wholesalePrice) : 0,
        stock: parseInt(req.body.stock),
        media: allMedia,
        imageUrl: primaryImage,
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
  upload.array('media') as any,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const files = req.files as Express.Multer.File[];
      let newMediaUrls: string[] = [];
      if (files && files.length > 0) {
        newMediaUrls = await Promise.all(files.map(f => uploadToCloudinary(f)));
      }

      let finalMedia = product.media || [];

      if (req.body.mediaUpdated === 'true' || req.body.existingMedia !== undefined) {
        let existingMedia: string[] = [];
        if (Array.isArray(req.body.existingMedia)) {
          existingMedia = req.body.existingMedia;
        } else if (typeof req.body.existingMedia === 'string' && req.body.existingMedia.trim() !== '') {
          existingMedia = [req.body.existingMedia];
        }
        finalMedia = [...existingMedia, ...newMediaUrls];
      } else if (newMediaUrls.length > 0) {
        finalMedia = [...finalMedia, ...newMediaUrls];
      }

      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.category = req.body.category || product.category;
      product.grade = req.body.grade || product.grade;
      if (req.body.price !== undefined) product.price = parseFloat(req.body.price);
      if (req.body.wholesalePrice !== undefined) product.wholesalePrice = parseFloat(req.body.wholesalePrice);
      if (req.body.stock !== undefined) product.stock = parseInt(req.body.stock);
      product.media = finalMedia;
      if (finalMedia.length > 0) {
        product.imageUrl = finalMedia[0];
      } else if (req.body.imageUrl) {
        product.imageUrl = req.body.imageUrl;
      }

      await product.save();
      res.json(product);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }
);

// DELETE product (Admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
