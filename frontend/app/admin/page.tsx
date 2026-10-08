'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    imageUrl: '',
    model3dUrl: '',
    videoUrl: ''
  });

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl text-red-500 font-bold">Access Denied. Admins Only.</h1>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        stock: parseInt(formData.stock),
        images: [formData.imageUrl],
        model3dUrl: formData.model3dUrl,
        videoUrl: formData.videoUrl,
        is3D: !!formData.model3dUrl
      };

      // Ensure token exists in actual implementation
      await axios.post('http://localhost:5000/api/products', payload, {
        headers: {
          // 'Authorization': `Bearer ${token}` 
        }
      });
      alert('Product created successfully!');
      setFormData({ name: '', price: '', category: '', description: '', stock: '', imageUrl: '', model3dUrl: '', videoUrl: '' });
    } catch (err) {
      console.error(err);
      alert('Error creating product');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="bubble-card bg-white p-8">
        <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
              <input required type="text" className="bubble-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select required className="bubble-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="">Select Category</option>
                <option value="RC Cars">RC Cars</option>
                <option value="Diecast Models">Diecast Models</option>
                <option value="Action Figures">Action Figures</option>
                <option value="Drones">Drones</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
              <input required type="number" step="0.01" className="bubble-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
              <input required type="number" className="bubble-input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea required rows={4} className="bubble-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
              <input required type="url" className="bubble-input" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">3D Model URL (.glb/.gltf)</label>
              <input type="url" className="bubble-input" value={formData.model3dUrl} onChange={e => setFormData({...formData, model3dUrl: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (.mp4)</label>
              <input type="url" className="bubble-input" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="bubble-btn w-full mt-8">
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
}
