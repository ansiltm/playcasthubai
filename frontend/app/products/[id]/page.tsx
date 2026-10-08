'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCartStore } from '../../../store/useCartStore';
import { ShoppingCart, Heart, Share2, Box, Image as ImageIcon, Video } from 'lucide-react';
import axios from 'axios';
import '@google/model-viewer'; // Import the web component

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'3d' | 'image' | 'video'>('3d');
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        // Fallback for visual testing
        setProduct({
          id: Number(id),
          name: 'RC Buggy Pro X1 Extreme Edition',
          price: 199.99,
          category: 'RC Cars',
          description: 'Experience the ultimate off-road adventure with the RC Buggy Pro X1. Features 4WD, independent suspension, and a top speed of 50mph. This is a hobby-grade masterpiece built for extreme bashers.',
          stock: 15,
          images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=1200'],
          model3dUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Sample 3D model
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          is3D: true
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addItem({
      id: Date.now(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.images?.[0]
    });
    alert('Added to cart!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Media Viewer Area */}
        <div className="space-y-6">
          <div className="bubble-card p-2 bg-white h-[500px] flex items-center justify-center overflow-hidden relative">
            {activeTab === '3d' && product.model3dUrl && (
              <model-viewer
                src={product.model3dUrl}
                auto-rotate
                camera-controls
                shadow-intensity="1"
                className="w-full h-full outline-none"
              ></model-viewer>
            )}
            
            {activeTab === 'image' && (
              <img 
                src={product.images?.[0]} 
                alt={product.name} 
                className="w-full h-full object-contain rounded-[var(--radius-bubble-sm)]"
              />
            )}

            {activeTab === 'video' && product.videoUrl && (
              <video 
                src={product.videoUrl} 
                controls 
                className="w-full h-full object-cover rounded-[var(--radius-bubble-sm)]"
              />
            )}
          </div>

          {/* Media Tabs */}
          <div className="flex gap-4 justify-center">
            {product.model3dUrl && (
              <button 
                onClick={() => setActiveTab('3d')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-[var(--radius-pill)] font-bold transition-all ${activeTab === '3d' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Box size={20} />
                <span>3D Model</span>
              </button>
            )}
            <button 
              onClick={() => setActiveTab('image')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-[var(--radius-pill)] font-bold transition-all ${activeTab === 'image' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <ImageIcon size={20} />
              <span>Images</span>
            </button>
            {product.videoUrl && (
              <button 
                onClick={() => setActiveTab('video')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-[var(--radius-pill)] font-bold transition-all ${activeTab === 'video' ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Video size={20} />
                <span>Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Info Area */}
        <div className="space-y-8">
          <div>
            <div className="text-sm font-bold text-secondary mb-2 uppercase tracking-wider">{product.category}</div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{product.name}</h1>
            <div className="text-4xl font-black text-primary mb-6">${product.price.toFixed(2)}</div>
            <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="p-6 bg-blue-50 rounded-[var(--radius-bubble)] border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-gray-700">Availability:</span>
              <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bubble-btn py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
