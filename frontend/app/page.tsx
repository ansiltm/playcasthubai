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
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Background Decorative Bubbles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
            Discover Toys in <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Glorious 3D
            </span>
          </h1>
          <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto">
            Experience RC cars, diecast models, and hobby-grade items like never before. Rotate, zoom, and explore before you buy.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/products" className="bubble-btn text-lg px-8 py-4">
              Explore Store
            </Link>
            <Link href="/categories" className="bubble-btn-secondary text-lg px-8 py-4">
              View Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-text-main mb-4">Trending Now</h2>
            <p className="text-text-muted">Our most popular models this week.</p>
          </div>
          <Link href="/products" className="text-primary font-bold hover:text-primary-dark hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
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
              <h3 className="text-xl font-bold mb-2">Interactive 3D</h3>
              <p className="text-text-muted">View models from every angle.</p>
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
