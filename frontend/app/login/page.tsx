'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In real app, call backend
      // const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      // login(res.data.user, res.data.token);
      
      // Mock login for now
      if (email === 'admin@playcasthub.com') {
        login({ id: 1, name: 'Admin User', email, role: 'admin' }, 'mock-token');
      } else {
        login({ id: 2, name: 'Test User', email, role: 'user' }, 'mock-token');
      }
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bubble-card p-10 bg-white">
        <div>
          <h2 className="text-center text-3xl font-black text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm font-bold text-center">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="sr-only">Email address</label>
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
              <label className="sr-only">Password</label>
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
              Sign In
            </button>
          </div>
          
          <div className="text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link href="/register" className="font-bold text-primary hover:text-primary-dark">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
