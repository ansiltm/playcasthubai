'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCartStore } from '../../../store/useCartStore';
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        // Fallback for visual testing
        setProduct({
          id: Number(id),
          name: 'RC Buggy Pro X1 Extreme Edition',
          price: 199.99,
          category: 'Vehicles & Remote-Controlled (RC)',
          description: 'Experience the ultimate off-road adventure with the RC Buggy Pro X1. Features 4WD, independent suspension, and a top speed of 50mph.',
          stock: 15,
          media: [
            'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200',
            'https://www.w3schools.com/html/mov_bbb.mp4'
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Loading product...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addItem({
      id: Date.now(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.media?.[0]
    });
    toast.success('Added to cart!');
  };

  const nextMedia = () => {
    if (product.media && product.media.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % product.media.length);
    }
  };

  const prevMedia = () => {
    if (product.media && product.media.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + product.media.length) % product.media.length);
    }
  };

  const currentMediaUrl = product.media?.[currentIndex];
  const isVideo = currentMediaUrl?.match(/\.(mp4|webm|mov|ogg)$/i) !== null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Media Viewer Carousel Area */}
        <div className="space-y-4">
          <div className="bubble-card p-2 bg-bubble-surface h-[500px] flex items-center justify-center overflow-hidden relative group">
            
            {product.media && product.media.length > 0 ? (
              <>
                {isVideo ? (
                  <video 
                    key={currentMediaUrl}
                    src={currentMediaUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain rounded-[var(--radius-bubble-sm)] animate-in fade-in duration-300"
                  />
                ) : (
                  <img 
                    key={currentMediaUrl}
                    src={currentMediaUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain rounded-[var(--radius-bubble-sm)] animate-in fade-in duration-300"
                  />
                )}

                {/* Carousel Controls */}
                {product.media.length > 1 && (
                  <>
                    <button 
                      onClick={prevMedia} 
                      className="absolute left-4 p-3 bg-bubble-surface/80 backdrop-blur-sm text-text-main hover:text-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextMedia} 
                      className="absolute right-4 p-3 bg-bubble-surface/80 backdrop-blur-sm text-text-main hover:text-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={24} />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-4 flex gap-2">
                      {product.media.map((_: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-primary scale-125' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-gray-400 font-bold">No media available</div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.media && product.media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
              {product.media.map((url: string, idx: number) => {
                const isThumbVideo = url.match(/\.(mp4|webm|mov|ogg)$/i) !== null;
                return (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all ${idx === currentIndex ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    {isThumbVideo ? (
                      <video src={url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info Area */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-sm font-bold text-secondary uppercase tracking-wider">{product.category}</div>
              {product.grade && (
                <div className="text-xs font-bold bg-bubble-input text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.grade}
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-text-main mb-4">{product.name}</h1>
            <div className="text-4xl font-black text-primary mb-6">₹{product.price.toFixed(2)}</div>
            <p className="text-lg text-text-muted leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="p-6 bg-bubble-input rounded-[var(--radius-bubble)] border border-border-main">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-text-main">Availability:</span>
              <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bubble-btn py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
              >
                <ShoppingCart size={24} />
                <span>Add to Cart</span>
              </button>
              <button className="bubble-btn-secondary p-4 rounded-[var(--radius-pill)]">
                <Heart size={24} />
              </button>
              <button className="bubble-btn-secondary p-4 rounded-[var(--radius-pill)]">
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
