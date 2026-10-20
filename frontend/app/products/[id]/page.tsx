'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '../../../store/useCartStore';
import { useFavoritesStore } from '../../../store/useFavoritesStore';
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Volume2, VolumeX, RotateCcw, Video, ShieldCheck, CheckCircle2, Zap, Check, Plus, Minus, Truck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import ProductPhoto from '../../../components/ProductPhoto';
import { productCover, productMedia, videoPoster, isVideoMedia, productColors, colorHasMedia } from '../../../lib/productMedia';

import { getColorSwatch } from '../../../lib/colors';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  /** Active media: color-specific if available, otherwise falls back to the product's generic media array. */
  const activeMedia = useMemo<string[]>(() => {
    return productMedia(product, selectedColor);
  }, [selectedColor, product]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'PlaycastHub',
      text: `Check out ${product?.name} on PlaycastHub!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    setProduct(null);
    setSelectedColor('');
    setQuantity(1);
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`, { signal: controller.signal });
        if (!active) return;
        const colors = productColors(res.data);
        setProduct({ ...res.data, colors });
        setCurrentIndex(0);
        setSelectedColor(colors[0] || '');
      } catch (err: any) {
        if (!active) return;
        setLoadError(err?.response?.status === 404 ? 'This product is no longer available.' : 'We could not load this product. Please try again.');
        setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (id) fetchProduct();
    return () => { active = false; controller.abort(); };
  }, [id, retry]);

  // When selected color changes, reset carousel to index 0 (or first video in active media)
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedColor]);

  const currentMediaUrl = activeMedia[currentIndex] || activeMedia[0];
  const isVideo = isVideoMedia(currentMediaUrl);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [currentIndex, isVideo, isMuted]);

  const activeCoverImage = useMemo(() => {
    return productCover(product, selectedColor) || '';
  }, [selectedColor, product]);

  const handleAddToCart = () => {
    if (!product || product.stock < quantity) return;
    addItem({
      id: `${product.id}-${selectedColor || 'default'}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: activeCoverImage,
      color: selectedColor || undefined,
    });
    toast.success(`Added ${quantity > 1 ? `${quantity}x ` : ''}${product.name}${selectedColor ? ` (${selectedColor})` : ''} to cart!`);
  };

  const handleBuyNow = () => {
    if (!product || product.stock < quantity) return;
    addItem({
      id: `${product.id}-${selectedColor || 'default'}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: activeCoverImage,
      color: selectedColor || undefined,
    });
    router.push('/cart');
  };

  const nextMedia = () => {
    if (activeMedia.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activeMedia.length);
    }
  };

  const prevMedia = () => {
    if (activeMedia.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + activeMedia.length) % activeMedia.length);
    }
  };

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextMedia();
    }
    if (isRightSwipe) {
      prevMedia();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Loading product...</div>;
  }

  if (!product) {
    return <div className="min-h-[60vh] flex flex-col gap-5 items-center justify-center p-6 text-center"><p role="alert">{loadError || 'Product not found.'}</p><button className="bubble-btn px-6 py-3" onClick={() => setRetry(value => value + 1)}>Try again</button><Link href="/products" className="text-primary underline">Browse all products</Link></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Media Viewer Carousel Area */}
        <div className="space-y-4">
          {selectedColor && <p className="text-sm text-text-muted" role="status">{colorHasMedia(product, selectedColor) ? `Showing ${selectedColor}` : `General product media — ${selectedColor} photos are not available yet.`}</p>}
          <div 
            className="bubble-card p-2 bg-bubble-surface h-[320px] sm:h-[500px] flex items-center justify-center overflow-hidden relative group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            
            {activeMedia.length > 0 ? (
              <>
                {isVideo ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      key={currentMediaUrl}
                      src={currentMediaUrl} 
                      poster={videoPoster(currentMediaUrl)}
                      controls 
                      autoPlay 
                      muted={isMuted}
                      loop
                      playsInline
                      preload="auto"
                      onCanPlay={(e) => {
                        e.currentTarget.muted = isMuted;
                        e.currentTarget.play().catch(() => {
                          if (e.currentTarget) {
                            e.currentTarget.muted = true;
                            setIsMuted(true);
                            e.currentTarget.play().catch(() => {});
                          }
                        });
                      }}
                      className="w-full h-full object-contain rounded-[var(--radius-bubble-sm)] animate-in fade-in duration-300"
                    />
                    {/* Quick Floating Audio Mute / Unmute Button */}
                    <button 
                      type="button"
                      onClick={toggleMute}
                      className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 transition-all hover:scale-105"
                      aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                    >
                      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-secondary" />}
                      <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                  </div>
                ) : (
                  <ProductPhoto
                    key={currentMediaUrl}
                    src={currentMediaUrl} 
                    name={product.name}
                    className="w-full h-full object-contain rounded-[var(--radius-bubble-sm)] animate-in fade-in duration-300"
                  />
                )}

                {/* Carousel Controls */}
                {activeMedia.length > 1 && (
                  <>
                    <button 
                      onClick={prevMedia} 
                      aria-label="Previous product photo or video"
                      className="absolute left-4 p-3 bg-bubble-surface/80 backdrop-blur-sm text-text-main hover:text-primary rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextMedia} 
                      aria-label="Next product photo or video"
                      className="absolute right-4 p-3 bg-bubble-surface/80 backdrop-blur-sm text-text-main hover:text-primary rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={24} />
                    </button>
                    {/* Dots */}
                    <div className="absolute bottom-4 flex gap-2">
                      {activeMedia.map((_: any, idx: number) => (
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
              <ProductPhoto name={product.name} className="w-full h-full" />
            )}
          </div>
          
          {/* Thumbnails */}
          {activeMedia.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
              {activeMedia.map((url: string, idx: number) => {
                const isThumbVideo = isVideoMedia(url);
                return (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`View ${isThumbVideo ? 'video' : 'photo'} ${idx + 1} of ${product.name}`}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all ${idx === currentIndex ? 'border-primary opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    {isThumbVideo ? (
                      <>
                        <ProductPhoto src={videoPoster(url)} name={`${product.name} video preview`} className="w-full h-full object-contain" />
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[8px] font-black bg-black/80 text-white flex items-center gap-0.5">
                          ▶ Vid
                        </span>
                      </>
                    ) : (
                      <img src={url} alt={`media-${idx}`} className="w-full h-full object-cover" />
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
            {product.ageLabel && product.ageLabel !== 'Not specified' && <p className="text-sm font-bold text-primary mb-3">Manufacturer recommended age: {product.ageLabel}</p>}
            {product.safetyNotes && <p className="rounded-xl border border-border-main p-4 text-sm mb-4 whitespace-pre-wrap">{product.safetyNotes}</p>}
            <h1 className="text-4xl md:text-5xl font-black text-text-main mb-4">{product.name}</h1>
            <div className="text-4xl font-black text-primary mb-6">₹{product.price.toFixed(2)}</div>
            <p className="text-lg text-text-muted leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="p-6 bg-bubble-input rounded-[var(--radius-bubble)] border border-border-main space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-main">
              <span className="font-bold text-text-main">Availability:</span>
              <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Available Colors Selection */}
            {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-main flex items-center gap-2">
                    <span>Available Color:</span>
                    <span className="text-primary font-black">{selectedColor || 'Default'}</span>
                  </span>
                  <span className="text-xs text-text-muted">{product.colors.length} {product.colors.length === 1 ? 'choice' : 'choices'}</span>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((colorName: string) => {
                    const isSelected = selectedColor === colorName;
                    const swatch = getColorSwatch(colorName);
                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => { setCurrentIndex(0); setSelectedColor(colorName); }}
                        aria-pressed={isSelected}
                        className={`group relative flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all duration-200 text-xs font-bold ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105'
                            : 'border-border-main bg-bubble-surface text-text-main hover:border-primary/50'
                        }`}
                        title={colorName}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 shadow-inner flex items-center justify-center shrink-0"
                          style={{
                            background: swatch.bg,
                            borderColor: swatch.border || 'rgba(0,0,0,0.15)',
                          }}
                        >
                          {isSelected && (
                            <Check size={10} className={swatch.bg.includes('#F8FAFC') || swatch.bg.includes('#FFFFFF') || swatch.bg.includes('#FDE047') ? 'text-black' : 'text-white'} strokeWidth={3} />
                          )}
                        </span>
                        <span>{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Controls */}
            <div className="flex items-center justify-between py-2 border-y border-border-main">
              <span className="text-sm font-bold text-text-main">Quantity:</span>
              <div className="flex items-center bg-bubble-surface rounded-full border border-border-main p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-full"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="font-black text-sm px-4 min-w-[2.5rem] text-center text-text-main">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, 99, q + 1))}
                  disabled={quantity >= Math.min(product.stock, 99)}
                  className="p-2 text-text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-full"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart + Buy Now + Wishlist + Share */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 bubble-btn-secondary py-3.5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border-2 border-primary/30 hover:border-primary transition-all"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 bubble-btn py-3.5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Zap size={20} className="fill-current" />
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => toggleFavorite(product.id)}
                  className={`flex-1 bubble-btn-secondary py-2.5 rounded-[var(--radius-pill)] transition-colors flex items-center justify-center gap-2 text-xs font-bold ${isFavorite(product.id) ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                >
                  <Heart size={16} className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''} />
                  <span>{isFavorite(product.id) ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="bubble-btn-secondary px-4 py-2.5 rounded-[var(--radius-pill)] hover:text-primary flex items-center justify-center gap-1.5 text-xs font-bold"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Trust and Delivery Highlights */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border-main text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-primary shrink-0" />
                <span>Express Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-secondary shrink-0" />
                <span>100% Inspected</span>
              </div>
            </div>

            <p className="text-xs text-center text-text-muted font-bold pt-2 flex items-center justify-center gap-1.5 border-t border-border-main">
              <RotateCcw size={14} className="text-emerald-500" />
              <span>7-Day Return Policy Enabled • Live Unboxing Video Mandatory</span>
            </p>
          </div>

          {/* Return & Replacement Policy Section */}
          <div className="bg-bubble-surface rounded-[var(--radius-bubble)] p-6 border-2 border-primary/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-main">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-text-main flex items-center gap-2 flex-wrap">
                    Return & Replacement Policy
                    <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Active for All Products
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted font-medium">Eligible for return, replacement, or refund in case of transit damage or defects</p>
                </div>
              </div>
            </div>

            {/* Mandatory Unboxing Video Callout */}
            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-black text-sm">
                <Video size={18} className="shrink-0 text-amber-600 animate-pulse" />
                <span>Mandatory Live Unboxing Video Required</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                To process any replacement, return, or refund claim for defective, damaged, or missing items, customers <strong className="text-text-main">must record a clear, continuous unboxing video</strong> while opening the courier package.
              </p>
              <div className="bg-bubble-surface/80 rounded-xl p-3 space-y-2 text-xs text-text-muted">
                <div className="flex items-start space-x-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Live Recording Only:</strong> The unboxing video must be captured live in a single, continuous take from the moment you cut open the courier flyer/box.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>No Edits or Cuts:</strong> Videos with cuts, pauses, trimming, or edits are <strong className="text-red-500 font-black">strictly NOT accepted</strong>.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Clear Shipping Label:</strong> The video must clearly display the courier shipping label with tracking details intact before unboxing.</span>
                </div>
              </div>
            </div>

            {/* Policy highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-text-muted">
              <div className="flex items-start space-x-2">
                <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
                <span><strong>7-Day Claim Window:</strong> Report return or replacement requests within 7 days of delivery.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Original Packaging:</strong> Keep original retail box, manuals, and accessories in original condition.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
