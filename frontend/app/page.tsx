'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';
import { shopCategories } from '../lib/categories';

export default function Home(): React.JSX.Element {
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Fetch trending products from backend
    const fetchTrendingProducts = async () => {
      try {
        const res = await api.get('/products/trending?order=desc&limit=6');
        setTrendingProducts(res.data);
      } catch (error) {
        console.error('Failed to fetch trending products', error);
        setTrendingProducts([]);
        setFailed(true);
      } finally { setLoading(false); }
    };
    fetchTrendingProducts();
  }, []);

  return (
    <div className="w-full">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bubble-card p-8 sm:p-12 bg-gradient-to-br from-primary/10 via-bubble-surface to-secondary/10">
          <p className="font-bold uppercase tracking-widest text-primary text-sm mb-4">Discover. Play. Collect.</p>
          <h1 className="text-4xl sm:text-6xl font-black text-text-main max-w-3xl leading-tight">Big adventures.<br />Little moments of joy.</h1>
          <p className="text-text-muted text-lg mt-5 max-w-2xl">Toys for curious kids, RC cars for weekend racers, and collectibles for lifelong fans. Find your next favourite at PlayCastHub.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/products" className="bubble-btn px-6 py-3">Explore all toys</Link>
            <Link href="/products?category=Vehicles%20%26%20Remote-Controlled%20(RC)" className="bubble-btn-secondary px-6 py-3">RC cars & vehicles</Link>
            <Link href="/products?favorites=true" className="bubble-btn-secondary px-6 py-3">Saved favourites</Link>
          </div>
        </div>
        <figure className="mt-6 overflow-hidden rounded-3xl bg-bubble-input">
          <img src="/images/toy-collection.webp" alt="Toy collection inspiration: miniature excavator, RC buggy, diecast cars and a kids camera" width={1774} height={887} fetchPriority="high" className="w-full h-auto" />
          <figcaption className="px-5 py-2 text-xs text-text-muted">Play inspiration · AI-created scene. See each product for its actual photos and specifications.</figcaption>
        </figure>
      </section>
      {/* Featured Products (Latest Finds) - Moved to top & limited to 6 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-black text-text-main mb-2">Latest Finds</h2>
            <p className="text-text-muted">Explore the latest additions to our collection.</p>
          </div>
          <Link href="/products" className="text-primary font-bold hover:text-primary-dark hover:underline">
            View All →
          </Link>
        </div>

        {loading && <p role="status" className="text-text-muted py-6">Loading the collection…</p>}
        {failed && <p role="alert" className="text-text-muted py-6">We could not load the collection. Please refresh in a moment.</p>}
        {!loading && !failed && trendingProducts.length === 0 && <p className="text-text-muted py-6">Our collection is coming soon. Check back for new arrivals.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-3xl font-black text-text-main">Shop by Category</h2>
          <span className="text-xs text-text-muted font-bold md:hidden animate-pulse">Swipe to explore →</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x custom-scrollbar">
          {shopCategories.map((cat, i) => (
            <Link 
              key={i} 
              href={`/products?category=${encodeURIComponent(cat.query)}`}
              className="bubble-card overflow-hidden flex-shrink-0 w-44 sm:w-48 pb-4 flex flex-col items-center text-center gap-3 snap-start hover:shadow-lg transition-all group"
            >
              <img src={`/images/category-${cat.image}.webp`} alt={`${cat.name} category illustration`} width={480} height={480} loading="lazy" className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" />
              <h3 className="font-bold text-sm px-3">{cat.name}</h3>
            </Link>
          ))}
        </div>
        <p className="text-xs text-text-muted">Category images are AI-created illustrations; product listings show available product photos.</p>
      </section>

      {/* Shop by Grade */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-3xl font-black text-text-main mb-6">Shop by Grade</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <section className="bg-bubble-surface py-12 border-y border-border-main mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-bubble-input rounded-[var(--radius-pill)] flex items-center justify-center text-primary mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Play for every interest</h3>
              <p className="text-text-muted">From everyday toys to hobby builds and display collectibles.</p>
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
              <h3 className="text-xl font-bold mb-2">Order with confidence</h3>
              <p className="text-text-muted">Place a COD order. Our team confirms delivery details before dispatch.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
