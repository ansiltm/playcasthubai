'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/ProductCard';
import api from '../../lib/api';
import { useFavoritesStore } from '../../store/useFavoritesStore';

function ProductsList() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('category');
  const gradeQuery = searchParams.get('grade');
  const onlyFavorites = searchParams.get('favorites') === 'true';
  const { favorites } = useFavoritesStore();
  const [sort, setSort] = useState('newest');
  const [age, setAge] = useState('');
  const [inStock, setInStock] = useState(false);
  const [error, setError] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1); // Reset page when filters change
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        let url = '/products';
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (categoryQuery) params.append('category', categoryQuery);
        if (gradeQuery) params.append('grade', gradeQuery);
        if (age) params.set('ageLabel', age);
        if (inStock) params.set('inStock', 'true');
        params.set('sort', sort === 'newest' ? 'createdAt' : 'price');
        params.set('order', sort === 'price-low' ? 'asc' : 'desc');
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const res = await api.get(url);
        setProducts(onlyFavorites ? res.data.filter((p: any) => favorites.includes(p.id)) : res.data);
      } catch (err) {
        console.error(err);
        setProducts([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchQuery, categoryQuery, gradeQuery, sort, age, inStock, onlyFavorites, favorites]);

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDisplayTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (categoryQuery) {
      const catMap: Record<string, string> = {
        'Vehicles & Remote-Controlled (RC)': 'Vehicles & RC',
        'Action Figures & Pop-Culture Collectibles': 'Action Figures',
        'Scale Model Kits & Hobby Crafts': 'Scale Model Kits',
        'Educational, STEM & STEAM Toys': 'STEM & Educational',
        'Electronic, Smart & Animatronic Toys': 'Smart Toys',
        'Outdoor, Sports & Active Play': 'Outdoor Play',
        'Pretend Play & Playsets': 'Pretend Play',
        'Building Sets & Construction Toys': 'Building Sets',
      };
      return catMap[categoryQuery] || categoryQuery;
    }
    if (gradeQuery) {
      const gradeMap: Record<string, string> = {
        'Semi-Hobby / Prosumer Grade': 'Semi-Hobby Grade',
        'Collector-Grade / Display-Grade': 'Collector-Grade',
        'Institutional / Commercial Grade': 'Commercial Grade',
        'Artisan / Designer Grade': 'Artisan Grade',
      };
      return gradeMap[gradeQuery] || gradeQuery;
    }
    return onlyFavorites ? 'Saved Favourites' : 'All Products';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-text-main mb-2">
          {getDisplayTitle()}
        </h1>
        <p className="text-text-muted">Showing {products.length} products</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <label className="text-sm font-bold">Sort <select className="bubble-input mt-1" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
        <label className="text-sm font-bold">Labelled age <select className="bubble-input mt-1" value={age} onChange={e => setAge(e.target.value)}><option value="">All ages</option>{['3+','6+','8+','14+','18+'].map(a => <option key={a}>{a}</option>)}</select></label>
        <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />In stock only</label>
      </div>
      {error ? <p role="alert" className="p-8 text-text-muted">The collection could not be loaded. Please refresh and try again.</p> : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center items-center mt-12 space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bubble-card bg-bubble-surface hover:bg-bubble-input disabled:opacity-50 transition-colors font-bold"
            >
              Prev
            </button>
            
            <div className="flex space-x-2 overflow-x-auto hide-scrollbar max-w-[200px] sm:max-w-none">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-[var(--radius-bubble)] font-bold flex items-center justify-center transition-all ${
                    currentPage === i + 1 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                      : 'bg-bubble-surface hover:bg-bubble-input text-text-main'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bubble-card bg-bubble-surface hover:bg-bubble-input disabled:opacity-50 transition-colors font-bold"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-bubble-surface bubble-card">
          <h2 className="text-2xl font-bold text-text-main mb-2">No products found</h2>
          <p className="text-text-muted">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductsList />
    </Suspense>
  );
}
