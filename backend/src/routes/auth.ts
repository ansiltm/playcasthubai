import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Otp } from '../models';
import { sendOtpEmail } from '../services/otpEmailService';

const router = Router();

/**
 * Send OTP for account registration verification
 * POST /api/auth/send-register-otp
 */
router.post('/send-register-otp', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any existing registration OTPs for this email and save new
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });
    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'register',
    });

    // Send email via Gmail SMTP
    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose: 'register',
      name,
    });

    res.json({ message: 'A 6-digit verification code has been sent to your email.' });
  } catch (error) {
    console.error('send-register-otp error:', error);
    res.status(500).json({ message: 'Failed to send verification code. Please try again.', error });
  }
});

/**
 * Register account with verified OTP
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, otp, role } = req.body;
    
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, phone number, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (!otp) {
      return res.status(400).json({ message: 'Please enter the 6-digit verification code sent to your email.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'register',
      otp: otp.toString().trim(),
    });

    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired verification code. Please check your email or request a new code.' });
    }

    // Double-check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered. Please sign in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      role: role || 'user',
    });

    // Delete used OTP
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });

    // Generate JWT token so user is automatically logged in
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account verified and registered successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      },
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ message: 'Server error during registration', error });
  }
});

/**
 * Send OTP for forgot password reset
 * POST /api/auth/forgot-password-otp
 */
router.post('/forgot-password-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any previous forgot_password OTPs and save new
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'forgot_password' });
    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'forgot_password',
    });

    // Send email
    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose: 'forgot_password',
      name: user.name,
    });

    res.json({ message: 'A 6-digit password reset code has been sent to your email.' });
  } catch (error) {
    console.error('forgot-password-otp error:', error);
    res.status(500).json({ message: 'Failed to send reset code. Please try again.', error });
  }
});

/**
 * Reset password using OTP
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'forgot_password',
      otp: otp.toString().trim(),
    });

    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired verification code. Please check your email or request a new code.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Clear used OTP
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'forgot_password' });

    res.json({ message: 'Your password has been reset successfully! You can now log in with your new password.' });
  } catch (error) {
    console.error('reset-password error:', error);
    res.status(500).json({ message: 'Server error during password reset', error });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      },
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Server error during login', error });
  }
});

export default router;
