'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/ProductCard';
import api from '../../lib/api';

function ProductsList() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('category');
  const gradeQuery = searchParams.get('grade');
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = '/products';
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (categoryQuery) params.append('category', categoryQuery);
        if (gradeQuery) params.append('grade', gradeQuery);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const res = await api.get(url);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        // Fallback for visual testing if backend isn't ready
        setProducts([
          { id: 1, name: 'RC Buggy Pro X1', price: 199.99, category: 'RC', grade: 'Hobby Grade', media: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800'] },
          { id: 2, name: 'Diecast Ford Mustang', price: 45.00, category: 'Diecast Models', grade: 'Toy Grade', media: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=800'] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchQuery, categoryQuery, gradeQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
          {searchQuery ? `Search Results for "${searchQuery}"` : categoryQuery ? categoryQuery : gradeQuery ? gradeQuery : 'All Products'}
        </h1>
        <p className="text-gray-500">Showing {products.length} products</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white bubble-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
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
