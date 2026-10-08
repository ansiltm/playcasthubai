'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password, phone, address, pincode });
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bubble-card p-10 bg-bubble-surface mt-10">
        <div>
          <h2 className="text-center text-3xl font-black text-text-main">Create an account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-text-main ml-1 mb-1 block">Full Name</label>
              <input
                type="text"
                required
                className="bubble-input"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-text-main ml-1 mb-1 block">Email address</label>
              <input
                type="email"
                required
                className="bubble-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-text-main ml-1 mb-1 block">Phone Number</label>
              <input
                type="tel"
                required
                className="bubble-input"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-text-main ml-1 mb-1 block">Pincode</label>
              <input
                type="text"
                required
                className="bubble-input"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-text-main ml-1 mb-1 block">Full Address</label>
              <textarea
                required
                rows={3}
                className="bubble-input"
                placeholder="Full Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-text-main ml-1 mb-1 block">Password</label>
              <input
                type="password"
                required
                className="bubble-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button type="submit" className="bubble-btn w-full text-center justify-center">
              Register
            </button>
          </div>
          
          <div className="text-center">
            <span className="text-sm text-text-muted">Already have an account? </span>
            <Link href="/login" className="font-bold text-primary hover:text-primary-dark">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
