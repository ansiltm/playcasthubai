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
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-2 mb-3">
            <div className="text-[9px] sm:text-[10px] font-bold text-secondary uppercase tracking-wider line-clamp-2 flex-1">
              {product.category}
            </div>
            {product.grade && (
              <div className="text-[8px] sm:text-[9px] font-black bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 border border-purple-200 dark:border-purple-800">
                {product.grade}
              </div>
            )}
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
