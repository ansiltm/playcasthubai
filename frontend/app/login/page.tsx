'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSendingResetOtp, setIsSendingResetOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { login } = useAuthStore();
  const router = useRouter();

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Send Reset OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      setIsSendingResetOtp(true);
      const res = await api.post('/auth/forgot-password-otp', { email: resetEmail });
      toast.success(res.data?.message || 'Password reset code sent to your email!');
      setForgotStep(2);
      setCooldown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setIsSendingResetOtp(false);
    }
  };

  // Step 2: Submit New Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim() || resetOtp.trim().length !== 6) {
      toast.error('Please enter the 6-digit code sent to your email.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsResetting(true);
      const res = await api.post('/auth/reset-password', {
        email: resetEmail,
        otp: resetOtp.trim(),
        newPassword,
      });

      toast.success(res.data?.message || 'Password reset successfully!');
      setEmail(resetEmail);
      setIsForgotMode(false);
      setForgotStep(1);
      setResetOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password reset failed. Please check the code.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bubble-card p-8 sm:p-10 bg-bubble-surface shadow-2xl border border-border-main animate-in fade-in duration-200">
        
        {/* ================= FORGOT PASSWORD MODE ================= */}
        {isForgotMode ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setForgotStep(1);
                }}
                className="p-2 bg-bubble-input hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-text-muted hover:text-text-main transition-colors"
                title="Back to login"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-2xl font-black text-text-main">
                {forgotStep === 1 ? 'Reset Password' : 'Enter Reset Code'}
              </h2>
            </div>
            
            <p className="text-xs text-text-muted mb-6">
              {forgotStep === 1 
                ? 'Enter your registered email address and we will send you a 6-digit verification code to reset your password.'
                : `We sent a 6-digit code to ${resetEmail}. Enter the code and choose a new password.`}
            </p>

            {/* Step 1: Request Code */}
            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetOtp} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1.5 block">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      className="bubble-input pl-10"
                      placeholder="your.email@gmail.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingResetOtp}
                  className="bubble-btn w-full text-center justify-center py-3.5 font-black text-sm flex items-center gap-2"
                >
                  {isSendingResetOtp ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" /> Sending Code...
                    </span>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Verify Code and Set New Password */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 block">
                      6-Digit Reset Code
                    </label>
                    {cooldown > 0 ? (
                      <span className="text-[11px] text-text-muted">Resend in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendResetOtp}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      className="bubble-input pl-10 tracking-[6px] font-mono font-bold text-center text-base"
                      placeholder="123456"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    />
                    <ShieldCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      className="bubble-input pl-10 pr-10"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1 block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      className="bubble-input pl-10"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="bubble-btn w-full text-center justify-center py-3.5 font-black text-sm flex items-center gap-2 mt-2"
                >
                  {isResetting ? 'Saving Password...' : 'Reset & Save Password'}
                </button>
              </form>
            )}

            <div className="text-center pt-4 border-t border-border-main mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setForgotStep(1);
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Remember your password? Sign In
              </button>
            </div>
          </div>
        ) : (
          /* ================= NORMAL LOGIN FORM ================= */
          <div>
            <div>
              <h2 className="text-center text-3xl font-black text-text-main">
                Sign In to Account
              </h2>
              <p className="text-center text-xs text-text-muted mt-2">
                Enter your credentials to access your PlaycastHub orders & account
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
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
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsForgotMode(true);
                      setForgotStep(1);
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="bubble-input pl-10 pr-10"
                    placeholder="Enter password"
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
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bubble-btn w-full text-center justify-center py-3.5 font-black text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    'Signing In...'
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
              
              <div className="text-center pt-2 border-t border-border-main">
                <span className="text-xs text-text-muted">Don't have an account? </span>
                <Link href="/register" className="font-bold text-xs text-primary hover:text-primary-dark">
                  Create Account Here
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
