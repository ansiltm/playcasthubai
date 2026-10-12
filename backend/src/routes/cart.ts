import { Router, Response } from 'express';
import { Cart, Product } from '../models';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: any, res: Response) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(it => it.productId.toString() === productId.toString());
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ productId, quantity: quantity || 1 });
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.productId');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.delete('/:itemId', authenticate, async (req: any, res: Response) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((it: any) => it._id.toString() !== itemId && it.productId.toString() !== itemId);
    await cart.save();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
