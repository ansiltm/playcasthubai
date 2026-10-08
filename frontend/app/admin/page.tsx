'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Trash2, Edit, CheckCircle, Plus, Search, X, AlertTriangle } from 'lucide-react';
import DataTable, { Column } from '../../components/DataTable';

export default function AdminPage() {
  const { user, isAdmin, token } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [mounted, setMounted] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', price: '', wholesalePrice: '', category: '', grade: '', description: '', stock: ''
  });
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isAdmin()) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {}
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data);
    } catch (err) {}
  };

  if (!mounted) return null;

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
    data.append('wholesalePrice', formData.wholesalePrice);
    data.append('category', formData.category);
    data.append('grade', formData.grade);
    data.append('description', formData.description);
    data.append('stock', formData.stock);
    
    if (mediaFiles) Array.from(mediaFiles).forEach(f => data.append('media', f));

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('New product added successfully!');
      }
      closeProductModal();
      fetchProducts();
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || 'Error saving product');
      }
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete}`);
      toast.success('Product deleted successfully!');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error('Failed to delete product');
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', wholesalePrice: '', category: '', grade: '', description: '', stock: '' });
    setMediaFiles(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name, price: p.price.toString(), wholesalePrice: p.wholesalePrice?.toString() || '0', category: p.category, 
      grade: p.grade, description: p.description, stock: p.stock.toString()
    });
    setMediaFiles(null);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingId(null);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Order status updated to ${status}!`);
      fetchOrders();
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error('Failed to update order status');
      }
    }
  };

  const productColumns: Column<any>[] = [
    { 
      header: 'Product Name', 
      accessorKey: 'name', 
      renderCell: (p) => {
        const firstMedia = p.media?.[0] || 'https://via.placeholder.com/300';
        const isVideo = firstMedia.match(/\.(mp4|webm|mov|ogg)$/i) !== null;
        
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[var(--radius-pill)] overflow-hidden bg-bubble-input shrink-0">
              {isVideo ? (
                <video src={firstMedia} className="w-full h-full object-cover" muted />
              ) : (
                <img src={firstMedia} alt={p.name} className="w-full h-full object-cover" />
              )}
            </div>
            <span className="font-bold truncate max-w-[200px]">{p.name}</span>
          </div>
        );
      }
    },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Grade', renderCell: (p) => <span className="px-3 py-1 bg-bubble-input rounded-full text-[10px] font-bold uppercase tracking-wider inline-block whitespace-nowrap">{p.grade}</span> },
    { header: 'Cost (Wholesale)', renderCell: (p) => <span className="font-bold text-orange-500 whitespace-nowrap">₹{p.wholesalePrice?.toFixed(2) || '0.00'}</span> },
    { header: 'Selling Price', renderCell: (p) => <span className="font-bold text-primary whitespace-nowrap">₹{p.price.toFixed(2)}</span> },
    { header: 'Stock', renderCell: (p) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block whitespace-nowrap ${p.stock > 10 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : p.stock > 0 ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
          {p.stock} units
        </span>
    )},
    { header: 'Actions', renderCell: (p) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => openEditModal(p)} className="p-2 bg-bubble-input text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Edit"><Edit size={16} /></button>
          <button onClick={() => { setProductToDelete(p.id); setIsDeleteModalOpen(true); }} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors" title="Delete"><Trash2 size={16} /></button>
        </div>
    )}
  ];

  const orderColumns: Column<any>[] = [
    { header: 'Order ID', renderCell: (o) => <span className="font-bold whitespace-nowrap">#{o.id}</span> },
    { header: 'Date', renderCell: (o) => <span className="whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</span> },
    { header: 'Total', renderCell: (o) => <span className="font-bold text-primary whitespace-nowrap">₹{o.totalAmount.toFixed(2)}</span> },
    { header: 'Items', renderCell: (o) => <span className="truncate max-w-[200px] inline-block">{o.OrderItems?.map((i:any) => `${i.quantity}x (ID:${i.productId})`).join(', ')}</span> },
    { header: 'Status', renderCell: (o) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block whitespace-nowrap ${o.status === 'pending' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-green-500/20 text-green-600 dark:text-green-400'}`}>
          {o.status}
        </span>
    )},
    { header: 'Actions', renderCell: (o) => (
        <div className="flex justify-end space-x-2">
          {o.status === 'pending' && (
            <button onClick={() => updateOrderStatus(o.id, 'confirmed')} className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600 shadow-sm">
              <CheckCircle size={14} /> <span>Confirm</span>
            </button>
          )}
          {(o.status === 'confirmed' || o.status === 'shipped') && (
            <button onClick={() => updateOrderStatus(o.id, o.status === 'confirmed' ? 'shipped' : 'delivered')} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary-dark shadow-sm">
              Mark {o.status === 'confirmed' ? 'Shipped' : 'Delivered'}
            </button>
          )}
        </div>
    )}
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
      <h1 className="text-3xl md:text-4xl font-black text-text-main mb-8">Super Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button onClick={() => setActiveTab('products')} className={`bubble-btn ${activeTab === 'products' ? '' : 'bubble-btn-secondary'}`}>Manage Inventory</button>
        <button onClick={() => setActiveTab('orders')} className={`bubble-btn ${activeTab === 'orders' ? '' : 'bubble-btn-secondary'}`}>Manage Orders</button>
      </div>

      {activeTab === 'products' && (
        <div className="bubble-card bg-bubble-surface p-6 md:p-8 overflow-hidden flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Inventory Table</h2>
            
            <div className="flex w-full md:w-auto space-x-4">
              <button onClick={openAddModal} className="bubble-btn py-2 flex items-center space-x-2 whitespace-nowrap">
                <Plus size={18} /> <span>Add Product</span>
              </button>
            </div>
          </div>
          
          <DataTable 
            columns={productColumns} 
            data={products} 
            searchKeys={['name', 'category', 'grade']} 
            searchPlaceholder="Search products by name, category, or grade..."
            emptyMessage="No products found in the inventory."
            itemsPerPage={10}
          />
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bubble-card bg-bubble-surface p-6 md:p-8 overflow-hidden flex flex-col">
          <h2 className="text-2xl font-bold mb-6">Customer Orders</h2>
          
          <DataTable 
            columns={orderColumns} 
            data={orders} 
            searchKeys={['id', 'status']} 
            searchPlaceholder="Search orders by ID or status..."
            emptyMessage="No orders found."
            itemsPerPage={10}
          />
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto bubble-card animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-bubble-surface/90 backdrop-blur-md p-6 border-b border-border-main flex justify-between items-center z-10">
              <h2 className="text-2xl font-black text-text-main">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeProductModal} className="p-2 bg-gray-100 text-text-muted rounded-full hover:bg-gray-200 hover:text-text-main transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">Product Name</label>
                <input required type="text" className="bubble-input py-3" placeholder="Enter product name..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Category</label>
                  <select required className="bubble-input py-3 px-4" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select Category...</option>
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
                  <label className="block text-sm font-bold text-text-main mb-2">Grade</label>
                  <select required className="bubble-input py-3 px-4" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                    <option value="">Select Grade...</option>
                    <option value="Toy-Grade">Toy-Grade</option>
                    <option value="Semi-Hobby / Prosumer Grade">Semi-Hobby / Prosumer Grade</option>
                    <option value="Hobby-Grade">Hobby-Grade</option>
                    <option value="Collector-Grade / Display-Grade">Collector-Grade / Display-Grade</option>
                    <option value="Institutional / Commercial Grade">Institutional / Commercial Grade</option>
                    <option value="Artisan / Designer Grade">Artisan / Designer Grade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Cost (Wholesale Rate) (₹)</label>
                  <input required type="number" step="0.01" placeholder="0.00" className="bubble-input py-3 !border-orange-300 focus:ring-orange-500/20" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Selling Price (₹)</label>
                  <input required type="number" step="0.01" placeholder="0.00" className="bubble-input py-3" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Stock Quantity</label>
                  <input required type="number" placeholder="0" className="bubble-input py-3" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">Detailed Description</label>
                <textarea required rows={4} className="bubble-input py-3" placeholder="Write a detailed description of the product..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="space-y-4 p-6 bg-bubble-input rounded-2xl border border-border-main">
                <h3 className="font-bold text-primary mb-4">Media Upload (Images & Videos)</h3>
                <div className="w-full">
                  <label className="block text-xs font-bold text-text-muted mb-2">Select Images and/or Videos</label>
                  <input type="file" multiple accept="image/*,video/*" onChange={e => setMediaFiles(e.target.files)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
                </div>
                {editingId && <p className="text-xs text-orange-600 font-bold mt-4 flex items-center gap-1"><AlertTriangle size={14}/> Note: Selecting new files will override existing media.</p>}
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="bubble-btn flex-1 py-4 text-lg shadow-lg">
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-text-main mb-2">Delete Product?</h3>
            <p className="text-text-muted mb-8">This action cannot be undone. Are you sure you want to completely remove this product?</p>
            <div className="flex space-x-4">
              <button onClick={() => { setIsDeleteModalOpen(false); setProductToDelete(null); }} className="flex-1 bubble-btn-secondary py-3">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white font-bold rounded-[var(--radius-pill)] hover:bg-red-600 shadow-lg hover:shadow-red-500/20 transition-all py-3">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
