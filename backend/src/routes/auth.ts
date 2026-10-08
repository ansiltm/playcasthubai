import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address, pincode, role } = req.body;
    
    if (!name || !email || !password || !phone || !address || !pincode) {
      return res.status(400).json({ message: 'All fields (name, email, password, phone, address, pincode) are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone, address, pincode, role: role || 'user' });
    res.status(201).json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, pincode: user.pincode, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
