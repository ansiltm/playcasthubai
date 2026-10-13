'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Eye } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  grade?: string;
  media?: string[];
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem({
      id: Date.now(), // Generate unique cart item id
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: (product.media && product.media.length > 0) ? product.media[0] : '/logo.jpeg'
    });
  };

  // Determine if the first media item is a video
  const fallbackImage = '/logo.jpeg';
  const firstMedia = (product.media && product.media.length > 0) ? product.media[0] : fallbackImage;
  const isVideo = typeof firstMedia === 'string' && firstMedia.match(/\.(mp4|webm|mov|ogg)$/i) !== null;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className={`bubble-card overflow-hidden bg-bubble-surface h-full flex flex-col ${isOutOfStock ? 'opacity-75 grayscale-[0.2]' : ''}`}>
        {/* Image/Video Container */}
        <div className="relative aspect-[4/3] sm:aspect-[4/3] w-full overflow-hidden bg-bubble-bg shrink-0">
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
          
          {/* Grade Badge overlay on image */}
          {product.grade && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span className="text-[9px] font-black bg-purple-900/80 backdrop-blur-md text-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-purple-400/30">
                {product.grade.replace(' / Display-Grade', '').replace(' / Prosumer Grade', '')}
              </span>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white font-black px-4 py-2 rounded-full uppercase tracking-wider text-xs shadow-lg transform -rotate-12">
                Out of Stock
              </span>
            </div>
          )}

          {!isOutOfStock && (
            <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handleAddToCart}
                className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark hover:scale-110 transition-all"
              >
                <ShoppingCart size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
          {/* Full-width Category */}
          <div className="text-[10px] sm:text-[11px] font-bold text-secondary dark:text-cyan-400 uppercase tracking-wider line-clamp-1 mb-1.5" title={product.category}>
            {product.category}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-text-main mb-3 line-clamp-2 flex-1 leading-snug">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-black text-primary">
              ₹{product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
