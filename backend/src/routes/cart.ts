import { Router, Response } from 'express';
import { Cart, CartItem, Product } from '../models';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: any, res: Response) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id }, include: [{ model: CartItem, include: [Product] }] });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post('/', authenticate, async (req: any, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }
    let cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (cartItem) {
      cartItem.quantity += quantity || 1;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({ cartId: cart.id, productId, quantity: quantity || 1 });
    }
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.delete('/:itemId', authenticate, async (req: any, res: Response) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const result = await CartItem.destroy({ where: { id: itemId, cartId: cart.id } });
    if (result) {
      res.json({ message: 'Item removed from cart' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
