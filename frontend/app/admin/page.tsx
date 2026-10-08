'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, Edit, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, token } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Product Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', grade: '', description: '', stock: ''
  });
  const [images, setImages] = useState<FileList | null>(null);
  const [videos, setVideos] = useState<FileList | null>(null);
  const [models, setModels] = useState<FileList | null>(null);

  useEffect(() => {
    if (isAdmin()) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      // Don't show toast if no orders yet or backend not ready
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <h1 className="text-2xl text-red-500 font-bold">Access Denied. Super Admins Only.</h1>
      </div>
    );
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('grade', formData.grade);
    data.append('description', formData.description);
    data.append('stock', formData.stock);
    
    if (images) Array.from(images).forEach(f => data.append('images', f));
    if (videos) Array.from(videos).forEach(f => data.append('videos', f));
    if (models) Array.from(models).forEach(f => data.append('model3d', f));

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated!');
      } else {
        await axios.post('http://localhost:5000/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        toast.success('Product added successfully!');
      }
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving product');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const editProduct = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name, price: p.price.toString(), category: p.category, 
      grade: p.grade, description: p.description, stock: p.stock.toString()
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', category: '', grade: '', description: '', stock: '' });
    setImages(null); setVideos(null); setModels(null);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">Super Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button onClick={() => setActiveTab('products')} className={`bubble-btn ${activeTab === 'products' ? '' : 'bubble-btn-secondary'}`}>Manage Products</button>
        <button onClick={() => setActiveTab('orders')} className={`bubble-btn ${activeTab === 'orders' ? '' : 'bubble-btn-secondary'}`}>Manage Orders</button>
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="xl:col-span-1 bubble-card bg-white p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                <input required type="text" className="bubble-input py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select required className="bubble-input py-2 px-4" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="Vehicles & Remote-Controlled (RC)">Vehicles & Remote-Controlled (RC)</option>
                    <option value="Action Figures & Pop-Culture Collectibles">Action Figures & Pop-Culture Collectibles</option>
                    <option value="Dolls & Doll Playsets">Dolls & Doll Playsets</option>
                    <option value="Building Sets & Construction Toys">Building Sets & Construction Toys</option>
                    <option value="Scale Model Kits & Hobby Crafts">Scale Model Kits & Hobby Crafts</option>
                    <option value="Games & Puzzles">Games & Puzzles</option>
                    <option value="Plush, Soft & Fabric Toys">Plush, Soft & Fabric Toys</option>
                    <option value="Educational, STEM & STEAM Toys">Educational, STEM & STEAM Toys</option>
                    <option value="Infant, Toddler & Preschool Toys">Infant, Toddler & Preschool Toys</option>
                    <option value="Arts, Crafts & Creative Activities">Arts, Crafts & Creative Activities</option>
                    <option value="Pretend Play, Role Play & Dress-Up">Pretend Play, Role Play & Dress-Up</option>
                    <option value="Outdoor, Sports & Active Play">Outdoor, Sports & Active Play</option>
                    <option value="Electronic, Smart & Animatronic Toys">Electronic, Smart & Animatronic Toys</option>
                    <option value="Novelty, Fidget & Sensory Toys">Novelty, Fidget & Sensory Toys</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Grade</label>
                  <select required className="bubble-input py-2 px-4" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                    <option value="">Select...</option>
                    <option value="Toy-Grade">Toy-Grade</option>
                    <option value="Semi-Hobby / Prosumer Grade">Semi-Hobby / Prosumer Grade</option>
                    <option value="Hobby-Grade">Hobby-Grade</option>
                    <option value="Collector-Grade / Display-Grade">Collector-Grade / Display-Grade</option>
                    <option value="Institutional / Commercial Grade">Institutional / Commercial Grade</option>
                    <option value="Artisan / Designer Grade">Artisan / Designer Grade</option>
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

              <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-700">Unlimited Media Uploads</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Images (Multiple)</label>
                  <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} className="w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Videos (Multiple)</label>
                  <input type="file" multiple accept="video/*" onChange={e => setVideos(e.target.files)} className="w-full text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">3D Models (.glb)</label>
                  <input type="file" multiple accept=".glb,.gltf" onChange={e => setModels(e.target.files)} className="w-full text-sm" />
                </div>
                {editingId && <p className="text-xs text-orange-500 font-bold mt-2">Uploading new files will overwrite old ones.</p>}
              </div>

              <div className="flex space-x-2">
                <button type="submit" className="bubble-btn flex-1 py-3">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="bubble-btn-secondary px-4">Cancel</button>
                )}
              </div>
            </form>
          </div>

          {/* Stock List */}
          <div className="xl:col-span-2 bubble-card bg-white p-6 md:p-8 overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Inventory</h2>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-gray-500 uppercase text-xs">
                    <th className="py-4 font-bold">Product</th>
                    <th className="py-4 font-bold">Category</th>
                    <th className="py-4 font-bold">Grade</th>
                    <th className="py-4 font-bold">Price</th>
                    <th className="py-4 font-bold">Stock</th>
                    <th className="py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 font-bold text-gray-900 truncate max-w-[200px]">{p.name}</td>
                      <td className="py-4 text-sm text-gray-600">{p.category}</td>
                      <td className="py-4 text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-bold">{p.grade}</span>
                      </td>
                      <td className="py-4 font-bold text-primary text-sm">₹{p.price.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-4 flex justify-end space-x-2">
                        <button onClick={() => editProduct(p)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"><Edit size={16} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bubble-card bg-white p-6 md:p-8 overflow-hidden">
          <h2 className="text-2xl font-bold mb-6">Customer Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-500 uppercase text-xs">
                  <th className="py-4 font-bold">Order ID</th>
                  <th className="py-4 font-bold">Date</th>
                  <th className="py-4 font-bold">Total</th>
                  <th className="py-4 font-bold">Items</th>
                  <th className="py-4 font-bold">Status</th>
                  <th className="py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900">#{o.id}</td>
                    <td className="py-4 text-sm text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 font-bold text-primary">₹{o.totalAmount.toFixed(2)}</td>
                    <td className="py-4 text-sm text-gray-600">
                      {o.OrderItems?.map((i:any) => `${i.quantity}x (ID:${i.productId})`).join(', ')}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 flex justify-end space-x-2">
                      {o.status === 'pending' && (
                        <button onClick={() => updateOrderStatus(o.id, 'confirmed')} className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600">
                          <CheckCircle size={14} /> <span>Confirm</span>
                        </button>
                      )}
                      {(o.status === 'confirmed' || o.status === 'shipped') && (
                        <button onClick={() => updateOrderStatus(o.id, o.status === 'confirmed' ? 'shipped' : 'delivered')} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark">
                          Mark {o.status === 'confirmed' ? 'Shipped' : 'Delivered'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
