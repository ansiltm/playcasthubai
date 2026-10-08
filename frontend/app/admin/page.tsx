'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Trash2, Edit, CheckCircle, Plus, Search, X, AlertTriangle, TrendingUp, DollarSign, Package } from 'lucide-react';
import DataTable, { Column } from '../../components/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminPage() {
  const { user, isAdmin, token } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [mounted, setMounted] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Filter States
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [analyticsStartDate, setAnalyticsStartDate] = useState('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState('');
  

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [manualOrderData, setManualOrderData] = useState({ productId: '', quantity: '1', price: '' });
  const [isCustomPrice, setIsCustomPrice] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', price: '', wholesalePrice: '', category: '', grade: '', description: '', stock: ''
  });
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    if (isAdmin()) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin, user]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {}
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      const sorted = res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
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
    
    // We send mediaUpdated=true to tell the backend we are sending existingMedia (which could be empty).
    data.append('mediaUpdated', 'true');
    existingMedia.forEach(url => data.append('existingMedia', url));
    
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

  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOrderData.productId || !manualOrderData.quantity) return;
    try {
      await api.post('/orders/manual', {
        productId: manualOrderData.productId,
        quantity: parseInt(manualOrderData.quantity),
        price: manualOrderData.price ? parseFloat(manualOrderData.price) : undefined
      });
      toast.success('Manual order created successfully!');
      setIsManualOrderModalOpen(false);
      setManualOrderData({ productId: '', quantity: '1', price: '' });
      setIsCustomPrice(false);
      fetchOrders();
      fetchProducts(); // refresh stock
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || 'Failed to create order');
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', wholesalePrice: '', category: '', grade: '', description: '', stock: '' });
    setMediaFiles(null);
    setExistingMedia([]);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingId(p.id);
    setFormData({
      name: p.name, price: p.price.toString(), wholesalePrice: p.wholesalePrice?.toString() || '0', category: p.category, 
      grade: p.grade, description: p.description, stock: p.stock.toString()
    });
    setMediaFiles(null);
    setExistingMedia(p.media || []);
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
          {p.stock}
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

  // Filtering Logic
  const filteredOrders = orders.filter(o => {
    let keep = true;
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) keep = false;
    if (orderStartDate && new Date(o.createdAt) < new Date(orderStartDate)) keep = false;
    if (orderEndDate && new Date(o.createdAt) > new Date(orderEndDate + 'T23:59:59')) keep = false;
    return keep;
  });

  const analyticsFilteredOrders = orders.filter(o => {
    let keep = true;
    if (analyticsStartDate && new Date(o.createdAt) < new Date(analyticsStartDate)) keep = false;
    if (analyticsEndDate && new Date(o.createdAt) > new Date(analyticsEndDate + 'T23:59:59')) keep = false;
    return keep;
  });

  // Analytics Calculation
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalItemsSold = 0;
  const monthlyDataMap = new Map();

  analyticsFilteredOrders.forEach(o => {
    if (o.status === 'cancelled') return;
    
    totalRevenue += o.totalAmount;
    
    const d = new Date(o.createdAt);
    const month = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyDataMap.has(month)) {
      monthlyDataMap.set(month, { name: month, sales: 0, profit: 0 });
    }
    const m = monthlyDataMap.get(month);
    m.sales += o.totalAmount;
    
    let orderProfit = 0;
    o.OrderItems?.forEach((item: any) => {
      const p = products.find(prod => prod.id === item.productId);
      const wholesale = p?.wholesalePrice || 0;
      orderProfit += (item.price - wholesale) * item.quantity;
      totalItemsSold += item.quantity;
    });
    
    m.profit += orderProfit;
    totalProfit += orderProfit;
  });

  const chartData = Array.from(monthlyDataMap.values()).reverse(); // Older first, assuming orders are DESC

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
      <h1 className="text-3xl md:text-4xl font-black text-text-main mb-8">Super Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('products')} className={`bubble-btn whitespace-nowrap ${activeTab === 'products' ? '' : 'bubble-btn-secondary'}`}>Manage Inventory</button>
        <button onClick={() => setActiveTab('orders')} className={`bubble-btn whitespace-nowrap ${activeTab === 'orders' ? '' : 'bubble-btn-secondary'}`}>Manage Orders</button>
        <button onClick={() => setActiveTab('analytics')} className={`bubble-btn whitespace-nowrap ${activeTab === 'analytics' ? '' : 'bubble-btn-secondary'}`}>Analytics Dashboard</button>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Customer Orders</h2>
            
            <div className="flex flex-col md:flex-row w-full md:w-auto items-start md:items-center gap-4">
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <label className="text-sm font-bold text-text-muted whitespace-nowrap">Status:</label>
                <select className="bubble-input py-2 text-sm w-full md:w-auto" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <label className="text-sm font-bold text-text-muted whitespace-nowrap">From:</label>
                <input type="date" className="bubble-input py-2 text-sm w-full md:w-auto" value={orderStartDate} onChange={(e) => setOrderStartDate(e.target.value)} />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto">
                <label className="text-sm font-bold text-text-muted whitespace-nowrap">To:</label>
                <input type="date" className="bubble-input py-2 text-sm w-full md:w-auto" value={orderEndDate} onChange={(e) => setOrderEndDate(e.target.value)} />
              </div>

              <button onClick={() => setIsManualOrderModalOpen(true)} className="bubble-btn py-2 flex items-center justify-center space-x-2 w-full md:w-auto whitespace-nowrap">
                <Plus size={18} /> <span>Manual Order</span>
              </button>
            </div>
          </div>
          
          <DataTable 
            columns={orderColumns} 
            data={filteredOrders} 
            searchKeys={['id', 'status']} 
            searchPlaceholder="Search orders by ID or status..."
            emptyMessage="No orders found."
            itemsPerPage={10}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-bubble-surface bubble-card p-4 gap-4">
            <h2 className="text-xl font-bold">Analytics Filter</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-bold text-text-muted whitespace-nowrap">From:</label>
                <input type="date" className="bubble-input py-2 text-sm" value={analyticsStartDate} onChange={(e) => setAnalyticsStartDate(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-bold text-text-muted whitespace-nowrap">To:</label>
                <input type="date" className="bubble-input py-2 text-sm" value={analyticsEndDate} onChange={(e) => setAnalyticsEndDate(e.target.value)} />
              </div>
              <button 
                onClick={() => { setAnalyticsStartDate(''); setAnalyticsEndDate(''); }} 
                className="bubble-btn-secondary py-2 text-sm whitespace-nowrap"
              >
                All Dates
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bubble-card bg-bubble-surface p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-[var(--radius-pill)] flex items-center justify-center mb-4">
                <DollarSign size={32} />
              </div>
              <h3 className="text-text-muted font-bold uppercase tracking-wider text-sm mb-1">Total Revenue</h3>
              <p className="text-3xl font-black text-text-main">₹{totalRevenue.toFixed(2)}</p>
            </div>
            
            <div className="bubble-card bg-bubble-surface p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-[var(--radius-pill)] flex items-center justify-center mb-4">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-text-muted font-bold uppercase tracking-wider text-sm mb-1">Total Profit</h3>
              <p className="text-3xl font-black text-text-main">₹{totalProfit.toFixed(2)}</p>
            </div>
            
            <div className="bubble-card bg-bubble-surface p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-[var(--radius-pill)] flex items-center justify-center mb-4">
                <Package size={32} />
              </div>
              <h3 className="text-text-muted font-bold uppercase tracking-wider text-sm mb-1">Items Sold</h3>
              <p className="text-3xl font-black text-text-main">{totalItemsSold}</p>
            </div>
          </div>

          <div className="bubble-card bg-bubble-surface p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-8">Monthly Sales & Profit</h2>
            {chartData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" tick={{fill: 'var(--color-text-muted)'}} />
                    <YAxis tick={{fill: 'var(--color-text-muted)'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-bubble-surface)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                    <Bar dataKey="sales" name="Revenue (₹)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Profit (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted font-bold">No data available to display.</div>
            )}
          </div>
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
                <h3 className="font-bold text-primary mb-2">Media Upload (Images & Videos)</h3>
                
                {existingMedia.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-text-muted mb-2">Currently Uploaded Media</label>
                    <div className="flex flex-wrap gap-3">
                      {existingMedia.map((url, idx) => {
                        const isVideo = url.match(/\.(mp4|webm|mov|ogg)$/i) !== null;
                        return (
                          <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border-main group">
                            {isVideo ? (
                              <video src={url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={url} alt="product" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => setExistingMedia(existingMedia.filter(m => m !== url))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <label className="block text-xs font-bold text-text-muted mb-2">Add New Files (Optional)</label>
                  <input type="file" multiple accept="image/*,video/*" onChange={e => setMediaFiles(e.target.files)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
                </div>
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

      {/* MANUAL ORDER MODAL */}
      {isManualOrderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-text-main">Create Manual Order</h3>
              <button onClick={() => setIsManualOrderModalOpen(false)} className="p-2 bg-gray-100 text-text-muted rounded-full hover:bg-gray-200 hover:text-text-main transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleManualOrderSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-main mb-2">Select Product</label>
                <select 
                  required 
                  className="bubble-input py-3 px-4 w-full"
                  value={manualOrderData.productId} 
                  onChange={e => {
                    const prod = products.find(p => p.id.toString() === e.target.value);
                    setManualOrderData({ ...manualOrderData, productId: e.target.value, price: prod ? prod.price.toString() : '' });
                  }}
                >
                  <option value="">-- Choose a Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock} | Price: ₹{p.price})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Quantity</label>
                  <input required type="number" min="1" className="bubble-input py-3 w-full" value={manualOrderData.quantity} onChange={e => setManualOrderData({...manualOrderData, quantity: e.target.value})} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-text-main">Custom Price?</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const prod = products.find(p => p.id.toString() === manualOrderData.productId);
                        if (!isCustomPrice && prod) {
                          setManualOrderData({...manualOrderData, price: prod.price.toString()});
                        }
                        setIsCustomPrice(!isCustomPrice);
                      }}
                      className={`w-10 h-6 rounded-full transition-colors relative ${isCustomPrice ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isCustomPrice ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {isCustomPrice ? (
                    <input required type="number" step="0.01" className="bubble-input py-3 w-full" value={manualOrderData.price} onChange={e => setManualOrderData({...manualOrderData, price: e.target.value})} placeholder="Custom rate (₹)" />
                  ) : (
                    <div className="bubble-input py-3 w-full bg-gray-50 text-text-muted cursor-not-allowed">
                      ₹{manualOrderData.price || '0.00'} (Default)
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-bubble-input p-4 rounded-xl border border-border-main">
                <p className="text-sm font-bold text-text-muted flex justify-between">
                  <span>Total Amount:</span>
                  <span className="text-lg text-primary">₹{((parseFloat(manualOrderData.price) || 0) * (parseInt(manualOrderData.quantity) || 0)).toFixed(2)}</span>
                </p>
              </div>
              <button type="submit" className="bubble-btn w-full py-4 text-lg shadow-lg">
                Confirm Order
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
