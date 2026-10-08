'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Eye } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  is3D?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: Date.now(), // Generate unique cart item id
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.images?.[0] || 'https://via.placeholder.com/300'
    });
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bubble-card overflow-hidden bg-white">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.is3D && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm flex items-center space-x-1">
              <Eye size={14} />
              <span>3D View</span>
            </div>
          )}
          <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark hover:scale-110 transition-all"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-xs font-bold text-secondary mb-2 uppercase tracking-wider">
            {product.category}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-primary">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
