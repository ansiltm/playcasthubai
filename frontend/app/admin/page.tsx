'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Trash2, Edit, CheckCircle, Plus, Search, X, AlertTriangle, TrendingUp, DollarSign, Package, Printer, ChevronDown, StickyNote, MessageSquare, Check, Loader2, UploadCloud, FileVideo, Image as ImageIcon } from 'lucide-react';
import DataTable, { Column } from '../../components/DataTable';
import SearchableSelect from '../../components/SearchableSelect';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminPage() {
  const { user, isAdmin, token } = useAuthStore();
  const router = useRouter();
  const manualKey = useRef<string | null>(null);
  const manualSignature = useRef('');
  const manualSubmitting = useRef(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [mounted, setMounted] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Filter States
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [orderDateRange, setOrderDateRange] = useState('all');
  

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [manualCustomer, setManualCustomer] = useState({ name: '', phone: '', address: '' });
  const [manualOrderItems, setManualOrderItems] = useState<Array<{ productId: string; name: string; quantity: number; price: number }>>([]);
  const [currentItem, setCurrentItem] = useState({ productId: '', quantity: '1', price: '' });
  const [isCustomPrice, setIsCustomPrice] = useState(false);

  const [isOrderViewModalOpen, setIsOrderViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDeleteModalOpen, setIsOrderDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Order Note Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedOrderForNote, setSelectedOrderForNote] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', price: '', wholesalePrice: '', category: '', grade: '', description: '', stock: '', ageLabel: 'Not specified', safetyNotes: '', colors: ''
  });
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newMediaPreviews, setNewMediaPreviews] = useState<Array<{ url: string; isVideo: boolean; name: string; size: string }>>([]);

  // Generate previews for newly selected media files
  useEffect(() => {
    if (!mediaFiles || mediaFiles.length === 0) {
      setNewMediaPreviews([]);
      return;
    }
    const previews = Array.from(mediaFiles).map(file => {
      const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov|ogg)$/i));
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        url: URL.createObjectURL(file),
        isVideo,
        name: file.name,
        size: `${sizeMb} MB`,
      };
    });
    setNewMediaPreviews(previews);

    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [mediaFiles]);

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

  const sortOrders = (ordersList: any[]) => {
    return [...ordersList].sort((a: any, b: any) => {
      const aIsPending = a.status === 'pending';
      const bIsPending = b.status === 'pending';

      // 1. Pending orders come first
      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;

      // 2. Both pending: Ascending order of order date (oldest first)
      if (aIsPending && bIsPending) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      // 3. For other orders: Ascending order of order date as requested
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(sortOrders(res.data));
    } catch (err) {}
  };

  if (!mounted) return null;

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <h1 className="text-2xl text-red-500 font-bold">Access Denied. Store Admins Only.</h1>
      </div>
    );
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingMedia) return;
    if (mediaFiles && (mediaFiles.length > 4 || Array.from(mediaFiles).some(f => f.size > 8 * 1024 * 1024))) { toast.error('Upload up to 4 files at a time, each under 8 MB.'); return; }

    setIsUploadingMedia(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('wholesalePrice', formData.wholesalePrice);
    data.append('category', formData.category);
    data.append('grade', formData.grade);
    data.append('description', formData.description);
    data.append('stock', formData.stock);
    data.append('ageLabel', formData.ageLabel);
    data.append('safetyNotes', formData.safetyNotes);
    data.append('colors', formData.colors);
    
    // We send mediaUpdated=true to tell the backend we are sending existingMedia (which could be empty).
    data.append('mediaUpdated', 'true');
    existingMedia.forEach(url => data.append('existingMedia', url));
    
    if (mediaFiles) Array.from(mediaFiles).forEach(f => data.append('media', f));

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, data, config);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', data, config);
        toast.success('New product added successfully!');
      }
      closeProductModal();
      fetchProducts();
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || 'Error saving product');
      }
    } finally {
      setIsUploadingMedia(false);
      setUploadProgress(0);
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

  const confirmOrderDelete = async () => {
    if (!orderToDelete) return;
    try {
      await api.delete(`/orders/${orderToDelete}`);
      toast.success('Order deleted successfully!');
      setIsOrderDeleteModalOpen(false);
      setOrderToDelete(null);
      fetchOrders();
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error('Failed to delete order');
      }
    }
  };

  const handleAddItemToManualOrder = () => {
    if (!currentItem.productId) {
      toast.error('Please select a product first');
      return;
    }
    const prod = products.find(p => p.id.toString() === currentItem.productId);
    if (!prod) return;

    const qty = parseInt(currentItem.quantity) || 1;
    if (qty <= 0) {
      toast.error('Quantity must be at least 1');
      return;
    }
    if (qty > prod.stock) {
      toast.error(`Only ${prod.stock} items available in stock for ${prod.name}`);
      return;
    }

    const price = currentItem.price ? parseFloat(currentItem.price) : prod.price;

    const existingIndex = manualOrderItems.findIndex(i => i.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...manualOrderItems];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].price = price;
      setManualOrderItems(updated);
    } else {
      setManualOrderItems([...manualOrderItems, { productId: prod.id, name: prod.name, quantity: qty, price }]);
    }

    setCurrentItem({ productId: '', quantity: '1', price: '' });
    setIsCustomPrice(false);
    toast.success(`Added ${prod.name} to order list`);
  };

  const handleRemoveManualItem = (index: number) => {
    setManualOrderItems(manualOrderItems.filter((_, i) => i !== index));
  };

  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let itemsToSubmit = [...manualOrderItems];

    // If no items were added to table yet but product is selected in dropdown, add it
    if (itemsToSubmit.length === 0 && currentItem.productId) {
      const prod = products.find(p => p.id.toString() === currentItem.productId);
      if (prod) {
        const qty = parseInt(currentItem.quantity) || 1;
        const price = currentItem.price ? parseFloat(currentItem.price) : prod.price;
        itemsToSubmit.push({ productId: prod.id, name: prod.name, quantity: qty, price });
      }
    }

    if (itemsToSubmit.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    try {
      if (manualSubmitting.current) return;
      manualSubmitting.current = true;
      const signature = JSON.stringify({manualCustomer, itemsToSubmit});
      if (!manualKey.current || manualSignature.current !== signature) { manualKey.current = crypto.randomUUID(); manualSignature.current = signature; }
      await api.post('/orders/manual', {
        customerName: manualCustomer.name || 'Custom Real-time Order',
        customerPhone: manualCustomer.phone,
        customerAddress: manualCustomer.address,
        items: itemsToSubmit.map(it => ({
          productId: it.productId,
          quantity: it.quantity,
          price: it.price
        }))
      }, { headers: { 'Idempotency-Key': manualKey.current } });
      manualKey.current = null;
      toast.success('Custom order created.');
      setIsManualOrderModalOpen(false);
      setManualOrderItems([]);
      setCurrentItem({ productId: '', quantity: '1', price: '' });
      setManualCustomer({ name: '', phone: '', address: '' });
      setIsCustomPrice(false);
      fetchOrders();
      fetchProducts(); // refresh stock
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || 'Failed to create order');
      }
    } finally { manualSubmitting.current = false; }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', wholesalePrice: '', category: '', grade: '', description: '', stock: '', ageLabel: 'Not specified', safetyNotes: '', colors: '' });
    setMediaFiles(null);
    setNewMediaPreviews([]);
    setExistingMedia([]);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingId(p.id);
    const colorStr = Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || '');
    setFormData({
      name: p.name, price: p.price.toString(), wholesalePrice: p.wholesalePrice?.toString() || '0', category: p.category, 
      grade: p.grade, description: p.description, stock: p.stock.toString(), ageLabel: p.ageLabel || 'Not specified', safetyNotes: p.safetyNotes || '', colors: colorStr
    });
    setMediaFiles(null);
    setNewMediaPreviews([]);
    setExistingMedia(p.media || []);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    if (isUploadingMedia) {
      toast.error('File upload is in progress. Please wait.');
      return;
    }
    setIsProductModalOpen(false);
    setEditingId(null);
    setMediaFiles(null);
    setNewMediaPreviews([]);
  };

  const updateOrderStatus = async (id: string, status: string) => {
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

  const getOrderStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25';
      case 'confirmed':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40 hover:bg-blue-500/25';
      case 'shipped':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 hover:bg-purple-500/25';
      case 'delivered':
        return 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40 hover:bg-teal-500/25';
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25';
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 hover:bg-rose-500/25';
      default:
        return 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/40 hover:bg-gray-500/25';
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      await api.put(`/orders/${id}/payment-status`, { paymentStatus });
      toast.success(`Payment marked as ${paymentStatus === 'paid' ? 'PAID' : 'NOT PAID'}!`);
      fetchOrders();
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error('Failed to update payment status');
      }
    }
  };

  const handleSaveNote = async () => {
    if (!selectedOrderForNote) return;
    try {
      setIsSavingNote(true);
      await api.put(`/orders/${selectedOrderForNote.id}/notes`, { notes: noteText });
      toast.success('Order note saved successfully!');
      setIsNoteModalOpen(false);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === selectedOrderForNote.id) {
        setSelectedOrder({ ...selectedOrder, notes: noteText });
      }
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error('Failed to save order note');
      }
    } finally {
      setIsSavingNote(false);
    }
  };

  const getPaymentBadgeClass = (paymentStatus: string) => {
    const isPaid = (paymentStatus || '').toLowerCase() === 'paid';
    return isPaid
      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 hover:bg-rose-500/25';
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
    { header: 'Age', renderCell: (p) => <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold inline-block whitespace-nowrap border border-blue-500/20">{p.ageLabel || 'Not specified'}</span> },
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

  const isCustomOrder = (o: any) => {
    return Boolean(
      o.paymentMethod?.toLowerCase().includes('custom') ||
      o.shippingAddressLine1?.toLowerCase().includes('custom') ||
      o.orderType === 'custom'
    );
  };

  const checkDateInRange = (dateStr: string, range: string) => {
    if (!range || range === 'all') return true;
    const d = new Date(dateStr);
    const now = new Date();
    
    if (range === 'today') {
      return d.toDateString() === now.toDateString();
    }
    
    if (range === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return d.toDateString() === yesterday.toDateString();
    }
    
    if (range === 'this_week') {
      const current = new Date(now);
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(current.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= startOfWeek;
    }
    
    if (range === 'last_week') {
      const current = new Date(now);
      const day = current.getDay();
      const diff = current.getDate() - day + (day === 0 ? -6 : 1) - 7;
      const startOfLastWeek = new Date(current.setDate(diff));
      startOfLastWeek.setHours(0, 0, 0, 0);
      
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);
      
      return d >= startOfLastWeek && d <= endOfLastWeek;
    }
    
    if (range === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    
    return true;
  };

  const orderColumns: Column<any>[] = [
    { 
      header: 'Order ID', 
      renderCell: (o) => {
        const isCustom = isCustomOrder(o);
        return (
          <div className="flex flex-col">
            <span className="font-bold whitespace-nowrap">{o.orderNumber || `#${o.id}`}</span>
            {isCustom ? (
              <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/15 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
                Custom Order
              </span>
            ) : (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
                Online Store
              </span>
            )}
          </div>
        );
      }
    },
    { 
      header: 'Order Date', 
      renderCell: (o) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-text-main whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</span>
          <span className="text-text-muted whitespace-nowrap">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    { 
      header: 'Customer Details', 
      renderCell: (o) => {
        const isCustom = isCustomOrder(o);
        const name = o.customerName || o.User?.name || 'Customer';
        const phone = o.customerPhone || o.User?.phone;
        return (
          <div className="flex flex-col max-w-[200px]">
            <span className="font-bold text-sm truncate text-text-main">{name}</span>
            {phone && <span className="text-xs text-text-muted">{phone}</span>}
          </div>
        );
      }
    },
    { 
      header: 'Items', 
      renderCell: (o) => {
        const itemsCount = o.OrderItems?.length || 0;
        const totalQty = o.OrderItems?.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || 0;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-sm whitespace-nowrap">{itemsCount} Products</span>
            <span className="text-xs text-text-muted whitespace-nowrap">{totalQty} Total Units</span>
          </div>
        );
      }
    },
    { 
      header: 'Total Amount', 
      renderCell: (o) => (
        <span className="font-black text-primary whitespace-nowrap text-base">
          ₹{o.totalAmount?.toFixed(2)}
        </span>
      )
    },
    { 
      header: 'Order Status', 
      renderCell: (o) => (
        <div className="relative inline-flex items-center">
          <select 
            className={`appearance-none pl-3.5 pr-8 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap outline-none cursor-pointer border transition-colors shadow-sm ${getOrderStatusBadgeClass(o.status)}`}
            value={o.status}
            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
          >
            {[o.status, ...({pending:['confirmed','cancelled'],confirmed:['shipped','completed','cancelled'],shipped:['delivered'],delivered:['completed'],completed:[],cancelled:[]} as Record<string,string[]>)[o.status] || []].map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80" />
        </div>
      )
    },
    { 
      header: 'Payment', 
      renderCell: (o) => {
        const isPaid = (o.paymentStatus || 'pending').toLowerCase() === 'paid';
        return (
          <div className="relative inline-flex items-center">
            <select 
              className={`appearance-none pl-3.5 pr-7 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap outline-none cursor-pointer border transition-colors shadow-sm ${getPaymentBadgeClass(o.paymentStatus)}`}
              value={isPaid ? 'paid' : 'pending'}
              onChange={(e) => updatePaymentStatus(o.id, e.target.value)}
            >
              <option value="paid" className="bg-[#0f172a] text-emerald-400 font-bold py-2" style={{ backgroundColor: '#0f172a', color: '#4ade80' }}>
                Paid
              </option>
              <option value="pending" className="bg-[#0f172a] text-rose-400 font-bold py-2" style={{ backgroundColor: '#0f172a', color: '#fb7185' }}>
                Not Paid
              </option>
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-80" />
          </div>
        );
      }
    },
    { 
      header: 'Notes', 
      renderCell: (o) => (
        <div className="flex items-center">
          {o.notes ? (
            <button
              onClick={() => {
                setSelectedOrderForNote(o);
                setNoteText(o.notes || '');
                setIsNoteModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bubble-input hover:bg-bubble-input/80 border border-border-main text-xs text-text-main max-w-[170px] truncate text-left transition-colors group"
              title={o.notes}
            >
              <StickyNote size={14} className="text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate font-medium">{o.notes}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedOrderForNote(o);
                setNoteText('');
                setIsNoteModalOpen(true);
              }}
              className="text-xs text-text-muted hover:text-primary flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-border-main hover:border-primary/50 transition-colors"
            >
              <Plus size={13} />
              <span>Add Note</span>
            </button>
          )}
        </div>
      )
    },
    { 
      header: 'Actions', 
      renderCell: (o) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => { setSelectedOrder(o); setIsOrderViewModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="View Details">
            <Package size={16} />
          </button>
          <button disabled={o.status !== 'cancelled'} onClick={() => { setOrderToDelete(o.id); setIsOrderDeleteModalOpen(true); }} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Filtering Logic
  const filteredOrders = sortOrders(orders.filter(o => {
    let keep = true;
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) keep = false;
    if (orderTypeFilter === 'custom' && !isCustomOrder(o)) keep = false;
    if (orderTypeFilter === 'online' && isCustomOrder(o)) keep = false;
    if (!checkDateInRange(o.createdAt, orderDateRange)) keep = false;
    return keep;
  }));

  // Analytics Calculation (All Time - Complete store records)
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalItemsSold = 0;
  const monthlyDataMap = new Map();

  orders.forEach(o => {
    if (o.status === 'cancelled' || o.paymentStatus !== 'paid') return;
    
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
      const wholesale = item.Product?.wholesalePrice || 0;
      orderProfit += (item.price - wholesale) * item.quantity;
      totalItemsSold += item.quantity;
    });
    
    m.profit += orderProfit;
    totalProfit += orderProfit;
  });

  const chartData = Array.from(monthlyDataMap.values()).reverse(); // Older first, assuming orders are DESC
  const pendingOrdersCount = orders.filter((o: any) => o.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
      <h1 className="text-3xl md:text-4xl font-black text-text-main mb-8">Store Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('products')} className={`bubble-btn whitespace-nowrap ${activeTab === 'products' ? '' : 'bubble-btn-secondary'}`}>Manage Inventory</button>
        <button onClick={() => setActiveTab('orders')} className={`relative bubble-btn whitespace-nowrap ${activeTab === 'orders' ? '' : 'bubble-btn-secondary'}`}>
          Manage Orders
          {pendingOrdersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {pendingOrdersCount}
            </span>
          )}
        </button>
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
            
            <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-bold text-text-muted whitespace-nowrap">Type:</label>
                <SearchableSelect
                  options={[
                    { label: 'All Orders', value: 'all' },
                    { label: 'Custom Orders', value: 'custom' },
                    { label: 'Online Orders', value: 'online' },
                  ]}
                  value={orderTypeFilter}
                  onChange={(val) => setOrderTypeFilter(val)}
                  className="w-36"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-bold text-text-muted whitespace-nowrap">Status:</label>
                <SearchableSelect
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Confirmed', value: 'confirmed' },
                    { label: 'Shipped', value: 'shipped' },
                    { label: 'Delivered', value: 'delivered' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ]}
                  value={orderStatusFilter}
                  onChange={(val) => setOrderStatusFilter(val)}
                  className="w-36"
                />
              </div>
              
              {/* Quick Date Range Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-bold text-text-muted whitespace-nowrap">Date:</label>
                <SearchableSelect
                  options={[
                    { label: 'All Time (Show All)', value: 'all' },
                    { label: 'Today', value: 'today' },
                    { label: 'Yesterday', value: 'yesterday' },
                    { label: 'This Week', value: 'this_week' },
                    { label: 'Last Week', value: 'last_week' },
                    { label: 'This Month', value: 'this_month' },
                  ]}
                  value={orderDateRange}
                  onChange={(val) => setOrderDateRange(val)}
                  className="w-44"
                />
              </div>

              <button onClick={() => setIsManualOrderModalOpen(true)} className="bubble-btn py-2 flex items-center justify-center space-x-2 whitespace-nowrap">
                <Plus size={18} /> <span>Create Custom Order</span>
              </button>
            </div>
          </div>
          
          <DataTable 
            columns={orderColumns} 
            data={filteredOrders} 
            searchKeys={['orderNumber', 'status', 'shippingAddressLine1']} 
            searchPlaceholder="Search orders by number, status, customer..."
            emptyMessage="No orders found."
            itemsPerPage={10}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bubble-card bg-bubble-surface p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-[var(--radius-pill)] flex items-center justify-center mb-4">
                <DollarSign size={32} />
              </div>
              <h3 className="text-text-muted font-bold uppercase tracking-wider text-sm mb-1">Paid Revenue</h3>
              <p className="text-3xl font-black text-text-main">₹{totalRevenue.toFixed(2)}</p>
            </div>
            
            <div className="bubble-card bg-bubble-surface p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-[var(--radius-pill)] flex items-center justify-center mb-4">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-text-muted font-bold uppercase tracking-wider text-sm mb-1">Gross Profit</h3>
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
            <h2 className="text-2xl font-bold mb-8">Monthly Paid Sales & Gross Profit</h2>
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
              <button 
                onClick={closeProductModal} 
                disabled={isUploadingMedia}
                className="p-2 bg-gray-100 text-text-muted rounded-full hover:bg-gray-200 hover:text-text-main transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Close"
              >
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
                  <SearchableSelect
                    options={[
                      { label: 'Vehicles & Remote-Controlled (RC)', value: 'Vehicles & Remote-Controlled (RC)' },
                      { label: 'Action Figures & Pop-Culture Collectibles', value: 'Action Figures & Pop-Culture Collectibles' },
                      { label: 'Dolls & Doll Playsets', value: 'Dolls & Doll Playsets' },
                      { label: 'Building Sets & Construction Toys', value: 'Building Sets & Construction Toys' },
                      { label: 'Scale Model Kits & Hobby Crafts', value: 'Scale Model Kits & Hobby Crafts' },
                      { label: 'Games & Puzzles', value: 'Games & Puzzles' },
                      { label: 'Plush, Soft & Fabric Toys', value: 'Plush, Soft & Fabric Toys' },
                      { label: 'Educational, STEM & STEAM Toys', value: 'Educational, STEM & STEAM Toys' },
                      { label: 'Infant, Toddler & Preschool Toys', value: 'Infant, Toddler & Preschool Toys' },
                      { label: 'Arts, Crafts & Creative Activities', value: 'Arts, Crafts & Creative Activities' },
                      { label: 'Pretend Play, Role Play & Dress-Up', value: 'Pretend Play, Role Play & Dress-Up' },
                      { label: 'Outdoor, Sports & Active Play', value: 'Outdoor, Sports & Active Play' },
                      { label: 'Electronic, Smart & Animatronic Toys', value: 'Electronic, Smart & Animatronic Toys' },
                      { label: 'Novelty, Fidget & Sensory Toys', value: 'Novelty, Fidget & Sensory Toys' },
                    ]}
                    value={formData.category}
                    onChange={(val) => setFormData({...formData, category: val})}
                    placeholder="Select Category..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Grade</label>
                  <SearchableSelect
                    options={[
                      { label: 'Toy-Grade', value: 'Toy-Grade' },
                      { label: 'Semi-Hobby / Prosumer Grade', value: 'Semi-Hobby / Prosumer Grade' },
                      { label: 'Hobby-Grade', value: 'Hobby-Grade' },
                      { label: 'Collector-Grade / Display-Grade', value: 'Collector-Grade / Display-Grade' },
                      { label: 'Institutional / Commercial Grade', value: 'Institutional / Commercial Grade' },
                      { label: 'Artisan / Designer Grade', value: 'Artisan / Designer Grade' },
                    ]}
                    value={formData.grade}
                    onChange={(val) => setFormData({...formData, grade: val})}
                    placeholder="Select Grade..."
                    className="w-full"
                  />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="font-bold">Manufacturer recommended age
                  <select className="bubble-input mt-2" value={formData.ageLabel} onChange={e => setFormData({...formData, ageLabel: e.target.value})}>
                    {['Not specified','3+','6+','8+','14+','18+'].map(age => <option key={age}>{age}</option>)}
                  </select>
                </label>
                <label className="font-bold">Safety and battery information
                  <textarea className="bubble-input mt-2" maxLength={1000} placeholder="Copy verified warnings and battery details from the packaging." value={formData.safetyNotes} onChange={e => setFormData({...formData, safetyNotes: e.target.value})} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-2">Available Colors (comma-separated)</label>
                <input 
                  type="text" 
                  className="bubble-input py-3" 
                  placeholder="e.g. Red, Metallic Blue, Gloss Black, White" 
                  value={formData.colors} 
                  onChange={e => setFormData({...formData, colors: e.target.value})} 
                />
                <p className="text-xs text-text-muted mt-1.5">
                  Enter color names separated by commas. These will display as interactive color swatches for buyers on the storefront product page.
                </p>
              </div>

              <div className="space-y-4 p-6 bg-bubble-input rounded-2xl border border-border-main">
                <h3 className="font-bold text-primary mb-2">Media Upload (up to 4 files per upload, 8 MB each)</h3>
                
                {existingMedia.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-text-muted mb-2">Currently Uploaded Media</label>
                    <div className="flex flex-wrap gap-3">
                      {existingMedia.map((url, idx) => {
                        const isVideo = Boolean(url.match(/\.(mp4|webm|mov|ogg)$/i)) || url.includes('/video/upload/');
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
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*" 
                    disabled={isUploadingMedia}
                    onChange={e => setMediaFiles(e.target.files)} 
                    className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                  <p className="text-[11px] text-text-muted mt-1.5">
                    Supports high-resolution images (.jpg, .png, .webp) and product demonstration videos (.mp4, .webm, .mov).
                  </p>
                </div>

                {/* NEWLY SELECTED PREVIEWS QUEUED FOR UPLOAD */}
                {newMediaPreviews.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-main animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-black text-text-main">
                        Files Queued for Upload ({newMediaPreviews.length})
                      </label>
                      {!isUploadingMedia && (
                        <button
                          type="button"
                          onClick={() => {
                            setMediaFiles(null);
                            setNewMediaPreviews([]);
                          }}
                          className="text-[11px] text-red-500 hover:underline font-bold"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {newMediaPreviews.map((item, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-border-main bg-bubble-surface p-2 flex flex-col gap-1.5 shadow-sm">
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/5">
                            {item.isVideo ? (
                              <video src={item.url} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            )}
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white flex items-center gap-1">
                              {item.isVideo ? <FileVideo size={10} /> : <ImageIcon size={10} />}
                              {item.isVideo ? 'Video' : 'Image'}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-text-main truncate" title={item.name}>
                            {item.name}
                          </div>
                          <div className="text-[10px] text-text-muted">{item.size}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* UPLOAD PROGRESS & LOADER BANNER */}
                {isUploadingMedia && (
                  <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                          <UploadCloud size={22} className="animate-bounce" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-text-main flex items-center gap-2">
                            <span>
                              {mediaFiles && mediaFiles.length > 0 
                                ? uploadProgress < 100 
                                  ? `Uploading ${mediaFiles.length} file(s) to server...` 
                                  : 'Uploading to Cloudinary media storage...'
                                : 'Saving product details...'}
                            </span>
                            <Loader2 size={14} className="animate-spin text-primary" />
                          </h4>
                          <p className="text-xs text-text-muted mt-0.5">
                            {uploadProgress < 100 
                              ? `${uploadProgress}% uploaded. Please keep this modal open.`
                              : 'Encoding videos/images and saving product in database...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-primary">{uploadProgress}%</span>
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300 relative"
                        style={{ width: `${Math.max(5, uploadProgress)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/25 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  type="submit" 
                  disabled={isUploadingMedia}
                  className="bubble-btn flex-1 py-4 text-lg shadow-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isUploadingMedia ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>
                        {mediaFiles && mediaFiles.length > 0
                          ? uploadProgress < 100
                            ? `Uploading Media (${uploadProgress}%)...`
                            : 'Uploading to Cloudinary... Please wait'
                          : 'Saving Product...'}
                      </span>
                    </>
                  ) : (
                    editingId ? 'Save Changes' : 'Create Product'
                  )}
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

        {/* ORDER VIEW MODAL */}
      {isOrderViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border-main">
              <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-black text-text-main">
                  Order Details {selectedOrder.orderNumber ? `(${selectedOrder.orderNumber})` : `(#${selectedOrder.id})`}
                </h3>
                {isCustomOrder(selectedOrder) ? (
                  <span className="px-3 py-1 bg-purple-500/15 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black uppercase tracking-wider">
                    Custom Order
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-wider">
                    Online Store
                  </span>
                )}
              </div>
              <button onClick={() => { setIsOrderViewModalOpen(false); setSelectedOrder(null); }} className="p-2 bg-gray-100 text-text-muted rounded-full hover:bg-gray-200 hover:text-text-main transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Customer & Delivery Info</h4>
                  <div className="bg-bubble-input p-4 rounded-[var(--radius-bubble)] space-y-1">
                    <p className="font-bold text-base text-text-main">
                      {selectedOrder.customerName || selectedOrder.User?.name || 'Customer'}
                    </p>
                    <p className="text-sm text-text-muted">{selectedOrder.User?.email || 'N/A'}</p>
                    <p className="text-sm text-text-muted">Contact Phone: <strong className="text-primary">{selectedOrder.customerPhone || selectedOrder.User?.phone || 'Not provided'}</strong></p>
                    <div className="text-xs text-text-muted mt-2 pt-2 border-t border-border-main">
                      <span className="font-bold block text-text-main mb-0.5">Address / Note:</span>
                      {selectedOrder.shippingAddressLine1 ? (
                        <>
                          {selectedOrder.shippingAddressLine1}
                          {selectedOrder.shippingAddressLine2 && <>, {selectedOrder.shippingAddressLine2}</>}
                          {selectedOrder.shippingCity && <>, {selectedOrder.shippingCity}</>}
                          {selectedOrder.shippingState && <>, {selectedOrder.shippingState}</>}
                          {selectedOrder.shippingPincode && <> - {selectedOrder.shippingPincode}</>}
                        </>
                      ) : (
                        'Direct / In-store'
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Order Information</h4>
                  <div className="bg-bubble-input p-4 rounded-[var(--radius-bubble)] space-y-2">
                    <p className="text-sm flex justify-between">
                      <span className="text-text-muted">Order Date:</span> 
                      <span className="font-bold">{new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-text-muted">Order Type:</span> 
                      <span className="font-bold">{isCustomOrder(selectedOrder) ? 'Custom Real-time Order' : 'Online Store Order'}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-text-muted">Payment:</span> 
                      <span className="font-bold uppercase text-emerald-600">{selectedOrder.paymentStatus || 'pending'} ({selectedOrder.paymentMethod || 'COD / Cash'})</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-text-muted">Status:</span> 
                      <span className="font-bold uppercase text-primary">{selectedOrder.status}</span>
                    </p>
                    <div className="pt-2 border-t border-border-main">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Internal Notes:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForNote(selectedOrder);
                            setNoteText(selectedOrder.notes || '');
                            setIsNoteModalOpen(true);
                          }}
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          {selectedOrder.notes ? 'Edit Note' : '+ Add Note'}
                        </button>
                      </div>
                      <p className="text-xs text-text-main italic bg-bubble-surface/60 p-2.5 rounded-xl border border-border-main">
                        {selectedOrder.notes || 'No notes added to this order yet.'}
                      </p>
                    </div>
                    <div className="border-t border-border-main pt-2 flex justify-between text-primary font-black text-lg">
                      <span>Total Amount:</span> 
                      <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                    {(() => {
                      const totalWholesale = selectedOrder.OrderItems?.reduce((acc: number, it: any) => {
                        const ws = it.Product?.wholesalePrice || 0;
                        return ws > 0 ? acc + (ws * it.quantity) : acc;
                      }, 0);
                      const totalProfit = totalWholesale > 0 ? (selectedOrder.totalAmount - totalWholesale) : 0;
                      return totalProfit > 0 ? (
                        <div className="flex justify-between text-emerald-600 font-bold text-sm pt-1">
                          <span>Total Est. Profit:</span>
                          <span>+₹{totalProfit.toFixed(2)}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">
                Items in this Order ({selectedOrder.OrderItems?.length || 0})
              </h4>
              <div className="space-y-3">
                {selectedOrder.OrderItems?.map((item: any, idx: number) => {
                  const mediaUrl = item.Product?.media?.[0] || item.Product?.imageUrl;
                  const isVideo = mediaUrl && mediaUrl.match(/\.(mp4|webm|mov|ogg)$/i) !== null;
                  const wholesale = item.Product?.wholesalePrice || 0;
                  const itemProfit = wholesale > 0 ? (item.price - wholesale) * item.quantity : 0;

                  return (
                    <div key={item._id || item.id || `order-item-${idx}`} className="flex items-center space-x-4 bg-bubble-input p-4 rounded-[var(--radius-bubble)]">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-border-main">
                        {mediaUrl ? (
                          isVideo ? 
                            <video src={mediaUrl} className="w-full h-full object-cover" /> :
                            <img src={mediaUrl} alt={item.Product?.name || 'Product'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400"><Package size={24} /></div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-text-main">{item.Product?.name || item.name || `Product ID: ${item.productId}`}</p>
                        {item.color && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary mt-1">
                            Color: {item.color}
                          </span>
                        )}
                        <p className="text-xs text-text-muted mt-0.5">Quantity: <strong className="text-text-main">{item.quantity}</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary text-base">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-text-muted">₹{item.price.toFixed(2)} each</p>
                        {itemProfit > 0 && (
                          <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                            Profit: +₹{itemProfit.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-border-main flex justify-between items-center">
              <button 
                onClick={() => window.print()} 
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2.5 rounded-xl transition"
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
              <button onClick={() => { setIsOrderViewModalOpen(false); setSelectedOrder(null); }} className="bubble-btn py-2 px-8">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER NOTE MODAL */}
      {isNoteModalOpen && selectedOrderForNote && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl max-w-md w-full p-6 border border-border-main">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-main">
              <div className="flex items-center gap-2">
                <StickyNote size={20} className="text-primary" />
                <h3 className="text-lg font-black text-text-main">
                  Order Note {selectedOrderForNote.orderNumber ? `(#${selectedOrderForNote.orderNumber})` : `(#${selectedOrderForNote.id})`}
                </h3>
              </div>
              <button 
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1.5 bg-bubble-input text-text-muted hover:text-text-main rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                  Internal Note / Delivery Instructions
                </label>
                <textarea
                  className="bubble-input w-full p-3.5 text-sm min-h-[120px] resize-y rounded-2xl"
                  placeholder="e.g., Paid via GPay, deliver after 6 PM, verified phone number..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="bubble-btn-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="bubble-btn px-6 py-2 text-xs font-bold"
                >
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DELETE CONFIRMATION MODAL */}
      {isOrderDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-text-main mb-2">Delete Order?</h3>
            <p className="text-text-muted mb-8">Only cancelled orders can be deleted. Their stock has already been restored. This removes the order record permanently.</p>
            <div className="flex space-x-4">
              <button onClick={() => { setIsOrderDeleteModalOpen(false); setOrderToDelete(null); }} className="flex-1 bubble-btn-secondary py-3">
                Cancel
              </button>
              <button onClick={confirmOrderDelete} className="flex-1 bg-red-500 text-white font-bold rounded-[var(--radius-pill)] hover:bg-red-600 shadow-lg hover:shadow-red-500/20 transition-all py-3">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL / CUSTOM ORDER MODAL */}
      {isManualOrderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border-main">
              <div>
                <h3 className="text-2xl font-black text-text-main">Create Custom / Manual Order</h3>
                <p className="text-xs text-text-muted mt-1">Add one or multiple items to create an instant real-time order with stock deduction.</p>
              </div>
              <button 
                onClick={() => {
                  setIsManualOrderModalOpen(false);
                  setManualOrderItems([]);
                  setCurrentItem({ productId: '', quantity: '1', price: '' });
                }} 
                className="p-2 bg-gray-100 text-text-muted rounded-full hover:bg-gray-200 hover:text-text-main transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Customer Information (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">Customer Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rahul Sharma" 
                      className="bubble-input py-2.5 w-full text-sm" 
                      value={manualCustomer.name} 
                      onChange={e => setManualCustomer({ ...manualCustomer, name: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. +91 9876543210" 
                      className="bubble-input py-2.5 w-full text-sm" 
                      value={manualCustomer.phone} 
                      onChange={e => setManualCustomer({ ...manualCustomer, phone: e.target.value })} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-text-muted mb-1">Address / Order Note</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Door Delivery / Direct Counter Sale" 
                      className="bubble-input py-2.5 w-full text-sm" 
                      value={manualCustomer.address} 
                      onChange={e => setManualCustomer({ ...manualCustomer, address: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              {/* Add Product Section */}
              <div className="bg-bubble-input p-4 rounded-2xl border border-border-main space-y-4">
                <h4 className="text-sm font-bold text-text-main">Add Products to Order</h4>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">Select Product</label>
                  <SearchableSelect
                    options={products.map(p => ({
                      label: `${p.name} (Stock: ${p.stock} | Price: ₹${p.price})`,
                      value: p.id.toString()
                    }))}
                    value={currentItem.productId}
                    onChange={(val) => {
                      const prod = products.find(p => p.id.toString() === val);
                      setCurrentItem({ ...currentItem, productId: val, price: prod ? prod.price.toString() : '' });
                    }}
                    placeholder="-- Search & Choose a Product --"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="bubble-input py-2.5 w-full text-sm bg-white dark:bg-zinc-800" 
                      value={currentItem.quantity} 
                      onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })} 
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-text-muted">Custom Rate?</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          const prod = products.find(p => p.id.toString() === currentItem.productId);
                          if (!isCustomPrice && prod) {
                            setCurrentItem({ ...currentItem, price: prod.price.toString() });
                          }
                          setIsCustomPrice(!isCustomPrice);
                        }}
                        className={`w-9 h-5 rounded-full transition-colors relative ${isCustomPrice ? 'bg-primary' : 'bg-gray-300'}`}
                      >
                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${isCustomPrice ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {isCustomPrice ? (
                      <input 
                        type="number" 
                        step="0.01" 
                        className="bubble-input py-2.5 w-full text-sm bg-white dark:bg-zinc-800" 
                        value={currentItem.price} 
                        onChange={e => setCurrentItem({ ...currentItem, price: e.target.value })} 
                        placeholder="Custom rate (₹)" 
                      />
                    ) : (
                      <div className="bubble-input py-2.5 w-full text-sm bg-gray-100 dark:bg-zinc-700 text-text-muted cursor-not-allowed">
                        ₹{currentItem.price || '0.00'} (Standard)
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleAddItemToManualOrder} 
                  disabled={!currentItem.productId}
                  className="bubble-btn-secondary w-full py-2.5 text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Plus size={16} />
                  <span>Add Product to Order List</span>
                </button>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">
                  Order Items ({manualOrderItems.length})
                </h4>
                {manualOrderItems.length === 0 ? (
                  <p className="text-xs text-text-muted italic bg-bubble-input p-3 rounded-xl">
                    No items added to the list yet. (If only ordering 1 product, select it above and click Confirm below).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {manualOrderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-bubble-input rounded-xl text-sm">
                        <div className="flex-grow pr-4">
                          <p className="font-bold text-text-main line-clamp-1">{item.name}</p>
                          <p className="text-xs text-text-muted">
                            {item.quantity} x ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex items-center space-x-3">
                          <span className="font-black text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveManualItem(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="bg-bubble-input p-4 rounded-xl border border-border-main flex justify-between items-center">
                <span className="font-bold text-text-muted">Total Order Value:</span>
                <span className="text-2xl font-black text-primary">
                  ₹{(
                    manualOrderItems.length > 0 
                      ? manualOrderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0)
                      : ((parseFloat(currentItem.price) || 0) * (parseInt(currentItem.quantity) || 0))
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-border-main flex items-center justify-end space-x-4">
              <button 
                type="button" 
                onClick={() => {
                  setIsManualOrderModalOpen(false);
                  setManualOrderItems([]);
                  setCurrentItem({ productId: '', quantity: '1', price: '' });
                }} 
                className="bubble-btn-secondary py-3 px-6"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleManualOrderSubmit} 
                className="bubble-btn py-3 px-8 text-base shadow-lg"
              >
                Confirm & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
