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
  grade?: string;
  media?: string[];
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
      imageUrl: product.media?.[0] || 'https://via.placeholder.com/300'
    });
  };

  // Determine if the first media item is a video
  const firstMedia = product.media?.[0] || 'https://via.placeholder.com/300';
  const isVideo = firstMedia.match(/\.(mp4|webm|mov|ogg)$/i) !== null;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bubble-card overflow-hidden bg-white h-full flex flex-col">
        {/* Image/Video Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 shrink-0">
          {isVideo ? (
            <video
              src={firstMedia}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={firstMedia}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
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
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="text-xs font-bold text-secondary uppercase tracking-wider">
              {product.category}
            </div>
            {product.grade && (
              <div className="text-[10px] font-bold bg-blue-50 text-primary px-2 py-1 rounded-full uppercase tracking-wider">
                {product.grade}
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 flex-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xl font-black text-primary">
              ₹{product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
