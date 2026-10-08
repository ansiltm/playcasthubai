'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminPage() {
  const { user, isAdmin } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    grade: '',
    description: '',
    stock: '',
    imageUrl: '',
    model3dUrl: '',
    videoUrl: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching stock', err);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchProducts();
    }
  }, [isAdmin]);

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <h1 className="text-2xl text-red-500 font-bold">Access Denied. Super Admins Only.</h1>
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
        grade: formData.grade,
        description: formData.description,
        stock: parseInt(formData.stock),
        images: [formData.imageUrl],
        model3dUrl: formData.model3dUrl,
        videoUrl: formData.videoUrl,
        is3D: !!formData.model3dUrl
      };

      await axios.post('http://localhost:5000/api/products', payload, {
        headers: {
          // 'Authorization': `Bearer ${token}` 
        }
      });
      alert('Product created successfully!');
      setFormData({ name: '', price: '', category: '', grade: '', description: '', stock: '', imageUrl: '', model3dUrl: '', videoUrl: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error creating product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">Super Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 bubble-card bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
              <input required type="text" className="bubble-input py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select required className="bubble-input py-2 px-4" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="Diecast">Diecast</option>
                  <option value="Diecast RC">Diecast RC</option>
                  <option value="RC">RC</option>
                  <option value="Toys">Toys</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Grade</label>
                <select required className="bubble-input py-2 px-4" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="Toy Grade">Toy Grade</option>
                  <option value="Semi Toy Grade">Semi Toy Grade</option>
                  <option value="Hobby Grade">Hobby Grade</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                <input required type="number" step="0.01" className="bubble-input py-2" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                <input required type="number" className="bubble-input py-2" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea required rows={3} className="bubble-input py-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                <input required type="url" className="bubble-input py-2" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">3D Model URL (.glb)</label>
                <input type="url" className="bubble-input py-2" value={formData.model3dUrl} onChange={e => setFormData({...formData, model3dUrl: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (.mp4)</label>
                <input type="url" className="bubble-input py-2" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="bubble-btn w-full mt-4">
              Add Product
            </button>
          </form>
        </div>

        {/* Stock List */}
        <div className="lg:col-span-2 bubble-card bg-white p-6 md:p-8 overflow-hidden flex flex-col">
          <h2 className="text-2xl font-bold mb-6">Current Stock & Products</h2>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-500 uppercase text-sm">
                  <th className="py-4 font-bold">Product</th>
                  <th className="py-4 font-bold">Category</th>
                  <th className="py-4 font-bold">Grade</th>
                  <th className="py-4 font-bold">Price</th>
                  <th className="py-4 font-bold">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900 truncate max-w-[200px]">{p.name}</td>
                    <td className="py-4 text-gray-600">{p.category}</td>
                    <td className="py-4 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-bold">{p.grade}</span>
                    </td>
                    <td className="py-4 font-bold text-primary">₹{p.price.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock} units
                      </span>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
