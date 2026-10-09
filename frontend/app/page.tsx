'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';

export default function Home(): React.JSX.Element {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch products from backend (fallback to dummy if backend fails)
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
        // Fallback dummy data for visual testing
        setProducts([
          { id: 1, name: 'RC Buggy Pro X1', price: 199.99, category: 'Vehicles & Remote-Controlled (RC)', media: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800'] },
          { id: 2, name: 'Diecast Ford Mustang', price: 45.00, category: 'Vehicles & Remote-Controlled (RC)', media: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=800'] },
          { id: 3, name: 'Drone Master 5000', price: 299.00, category: 'Vehicles & Remote-Controlled (RC)', media: ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&q=80&w=800'] },
        ]);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full">
      {/* Featured Products (Trending Now) - Moved to top & limited to 5 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-black text-text-main mb-2">Trending Now</h2>
            <p className="text-text-muted">Our most popular models this week.</p>
          </div>
          <Link href="/products" className="text-primary font-bold hover:text-primary-dark hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-3xl font-black text-text-main mb-6">Shop by Category</h2>
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
          {[
            { name: 'Vehicles & RC', query: 'Vehicles & Remote-Controlled (RC)', icon: '🏎️' },
            { name: 'Action Figures', query: 'Action Figures & Pop-Culture Collectibles', icon: '🦸‍♂️' },
            { name: 'Model Kits', query: 'Scale Model Kits & Hobby Crafts', icon: '🛠️' },
            { name: 'STEM & Tech', query: 'Educational, STEM & STEAM Toys', icon: '🔬' },
            { name: 'Smart Toys', query: 'Electronic, Smart & Animatronic Toys', icon: '🤖' },
            { name: 'Outdoor Play', query: 'Outdoor, Sports & Active Play', icon: '⛺' }
          ].map((cat, i) => (
            <Link 
              key={i} 
              href={`/products?category=${encodeURIComponent(cat.query)}`}
              className="bubble-card flex-shrink-0 w-48 p-6 flex flex-col items-center justify-center text-center gap-4 snap-start hover:bg-primary hover:text-white transition-all group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="font-bold">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by Grade */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-3xl font-black text-text-main mb-6">Shop by Grade</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Toy-Grade', query: 'Toy-Grade', desc: 'Entry-level fun for everyone' },
            { name: 'Semi-Hobby', query: 'Semi-Hobby / Prosumer Grade', desc: 'Step up your game' },
            { name: 'Hobby-Grade', query: 'Hobby-Grade', desc: 'Pro modular & repairable builds' },
            { name: 'Collector', query: 'Collector-Grade / Display-Grade', desc: 'Extreme scale display fidelity' }
          ].map((grade, i) => (
            <Link 
              key={i} 
              href={`/products?grade=${encodeURIComponent(grade.query)}`}
              className="bubble-card p-6 border-l-4 hover:border-l-primary hover:shadow-lg transition-all"
            >
              <h3 className="font-black text-xl mb-2">{grade.name}</h3>
              <p className="text-sm text-text-muted">{grade.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Banner */}
      <section className="bg-bubble-surface py-20 border-y border-border-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-bubble-input rounded-[var(--radius-pill)] flex items-center justify-center text-primary mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-text-muted">Only the best hobby-grade items.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-50 rounded-[var(--radius-pill)] flex items-center justify-center text-secondary mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">High-Quality Media</h3>
              <p className="text-text-muted">Experience toys in detailed images and videos.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-50 rounded-[var(--radius-pill)] flex items-center justify-center text-purple-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
              <p className="text-text-muted">Get your toys delivered quickly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
