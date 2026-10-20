'use client';

import Link from 'next/link';
import ProductPhoto from './ProductPhoto';
import { productCover, productMedia, isVideoMedia } from '../lib/productMedia';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  grade?: string;
  ageLabel?: string;
  colors?: string[];
  media?: string[];
  imageUrl?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem({
      id: product.id, // Generate unique cart item id
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: productCover(product) || ''
    });
  };

  return (
    <article className="group block h-full">
      <div className={`bubble-card overflow-hidden bg-bubble-surface h-full flex flex-col ${isOutOfStock ? 'opacity-75 grayscale-[0.2]' : ''}`}>
        {/* Image/Video Container */}
        <div className="relative aspect-[4/3] sm:aspect-[4/3] w-full overflow-hidden bg-bubble-bg shrink-0">
          <Link href={`/products/${product.id}`} aria-label={`View ${product.name}`} className="block w-full h-full">
            <ProductPhoto src={productCover(product)} name={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
          </Link>
          
          {/* Grade Badge overlay on image */}
          {product.grade && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span className="text-[9px] font-black bg-purple-900/80 backdrop-blur-md text-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-purple-400/30">
                {product.grade.replace(' / Display-Grade', '').replace(' / Prosumer Grade', '')}
              </span>
            </div>
          )}

          {/* Live Video Badge */}
          {productMedia(product).some(isVideoMedia) && (
            <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
              <span className="flex items-center gap-1.5 text-[9px] font-black bg-black/75 backdrop-blur-md text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Video
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
            <div className="absolute bottom-3 right-3 transition-all duration-300">
              <button
                aria-label={`Add ${product.name} to cart`}
                onClick={product.colors?.length ? undefined : handleAddToCart}
                hidden={Boolean(product.colors?.length)}
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
            <Link href={`/products/${product.id}`} className="hover:text-primary">{product.name}</Link>
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {product.ageLabel && product.ageLabel !== 'Not specified' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Age: {product.ageLabel}
              </span>
            )}
            {product.colors && product.colors.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {product.colors.length} {product.colors.length === 1 ? 'Color' : 'Colors'}
              </span>
            )}
          </div>
          <Link href={`/products/${product.id}`} className="mt-3 text-xs font-bold text-primary underline underline-offset-4">{product.colors?.length ? 'Choose colour & view details' : 'View details'}</Link>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-black text-primary">
              ₹{product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
