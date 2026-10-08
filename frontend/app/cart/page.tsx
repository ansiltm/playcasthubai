'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }
    
    try {
      await api.post('/orders', { items });
      toast.success('Order placed successfully!');
      clearCart();
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || 'Checkout failed');
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Discover our amazing collection of RC cars and toys.</p>
        <Link href="/" className="bubble-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.productId} className="bubble-card bg-white p-6 flex flex-col sm:flex-row items-center gap-6">
              <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded-2xl bg-gray-50" />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <div className="text-2xl font-black text-primary">₹{item.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                  <button 
                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                    className="p-3 text-gray-500 hover:text-primary transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-3 text-gray-500 hover:text-primary transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => removeItem(item.productId)}
                  className="p-3 text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bubble-card bg-white p-8 sticky top-24">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-gray-900">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-bold text-gray-900">₹{(getTotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-primary">₹{(getTotal() * 1.1).toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="bubble-btn w-full flex items-center justify-center space-x-2 py-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
