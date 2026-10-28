'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, Phone, User, ShieldCheck, ArrowRight, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { login } = useAuthStore();
  const router = useRouter();

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address first.');
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await api.post('/auth/send-register-otp', { email, name });
      toast.success(res.data?.message || 'Verification code sent to your email!');
      setOtpSent(true);
      setCooldown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!otpSent) {
      toast.error('Please verify your email by requesting a code first.');
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your contact phone number.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        otp: otp.trim(),
      });

      // Automatically login the newly created user
      if (res.data?.token && res.data?.user) {
        login(res.data.user, res.data.token);
      }

      toast.success('Account created and verified successfully!');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bubble-card p-8 sm:p-10 bg-bubble-surface shadow-2xl border border-border-main">
        <div>
          <h2 className="text-center text-3xl font-black text-text-main">
            Create an Account
          </h2>
          <p className="text-center text-xs text-text-muted mt-2">
            Join PlaycastHub to track orders, manage purchases & access member deals
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1.5 block">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                className="bubble-input pl-10"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

          {/* Email Address with Send OTP Button */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1.5 block">
              Email Address
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  className="bubble-input pl-10"
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || cooldown > 0}
                className="bubble-btn text-xs px-3.5 shrink-0 whitespace-nowrap disabled:opacity-60"
              >
                {isSendingOtp ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw size={14} className="animate-spin" /> Sending...
                  </span>
                ) : cooldown > 0 ? (
                  `Resend (${cooldown}s)`
                ) : otpSent ? (
                  'Resend Code'
                ) : (
                  'Send Code'
                )}
              </button>
            </div>
            <p className="text-[11px] text-text-muted ml-1 mt-1">
              We will send a 6-digit verification code to this email
            </p>
          </div>

          {/* 6-Digit OTP Field (Visible once sent or always visible) */}
          {otpSent && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-wider block">
                  6-Digit Verification Code
                </label>
                <span className="text-[11px] text-emerald-500 font-bold">Code Sent to Email</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  className="bubble-input pl-10 tracking-[6px] font-mono font-bold text-base text-center"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <ShieldCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
              </div>
              <p className="text-[11px] text-text-muted mt-1.5 text-center">
                Check your Gmail inbox / spam folder for the code
              </p>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1.5 block">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                className="bubble-input pl-10"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="bubble-input pl-10 pr-10"
                placeholder="Create password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[11px] text-text-muted ml-1 mt-1">
              At least 8 characters long (standard password)
            </p>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bubble-btn w-full text-center justify-center py-3.5 font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
          
          <div className="text-center pt-2 border-t border-border-main">
            <span className="text-xs text-text-muted">Already have an account? </span>
            <Link href="/login" className="font-bold text-xs text-primary hover:text-primary-dark">
              Sign In Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
