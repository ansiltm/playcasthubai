'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/api';
import VerifyOrderEmail from '../../components/VerifyOrderEmail';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  ChevronRight, 
  ArrowLeft, 
  ShoppingBag, 
  Phone, 
  MapPin, 
  FileText,
  Calendar,
  X
} from 'lucide-react';

interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  Product?: {
    id?: string;
    name?: string;
    imageUrl?: string;
    media?: string[];
  };
}

interface Order {
  _id?: string;
  id?: string;
  orderNumber?: string;
  orderType?: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  createdAt: string;
  OrderItems: OrderItem[];
}

export default function OrdersPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, mounted]);

  if (!mounted) return null;

  // Not logged in view
  if (!user && !token) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Package size={40} />
        </div>
        <h1 className="text-3xl font-black text-text-main mb-3">Track Your Orders</h1>
        <p className="text-text-muted max-w-md mx-auto mb-8">
          Please log in to your PlaycastHub account to view your past orders, invoice details, and live delivery tracking status.
        </p>
        <Link href="/login" className="bubble-btn inline-flex px-8 py-3.5">
          Login to Your Account
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          label: 'Order Placed',
          color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          icon: <Clock size={14} className="mr-1.5" />,
          stepIndex: 1
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
          icon: <CheckCircle size={14} className="mr-1.5" />,
          stepIndex: 2
        };
      case 'shipped':
        return {
          label: 'Shipped',
          color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
          icon: <Truck size={14} className="mr-1.5" />,
          stepIndex: 3
        };
      case 'delivered':
      case 'completed':
        return {
          label: status === 'completed' ? 'Completed' : 'Delivered',
          color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle size={14} className="mr-1.5" />,
          stepIndex: 4
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
          icon: <XCircle size={14} className="mr-1.5" />,
          stepIndex: 0
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30',
          icon: <Clock size={14} className="mr-1.5" />,
          stepIndex: 1
        };
    }
  };

  const trackingSteps = [
    { title: 'Order Placed', desc: 'Received & Queued' },
    { title: 'Confirmed', desc: 'Verified by Team' },
    { title: 'Dispatched', desc: 'In Transit' },
    { title: 'Delivered', desc: 'Package Arrived' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border-main">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 bg-bubble-input hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-text-muted hover:text-text-main transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-3xl font-black text-text-main">My Orders & Tracking</h1>
          </div>
          <p className="text-text-muted text-sm mt-1 ml-11">
            Track real-time status and view detailed history of all your purchases
          </p>
        </div>
        <Link href="/products" className="bubble-btn text-sm px-5 py-2.5 flex items-center gap-2">
          <ShoppingBag size={16} />
          <span>Explore Products</span>
        </Link>
      </div>

      <VerifyOrderEmail />
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-muted text-sm font-medium">Loading your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-bubble-surface border border-border-main rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-bubble-input text-text-muted rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-2xl font-black text-text-main mb-2">No Orders Yet</h2>
          <p className="text-text-muted max-w-md mx-auto mb-6 text-sm">
            You have not placed any orders yet. Discover our collection of RC models, diecast cars, and hobby toys!
          </p>
          <Link href="/products" className="bubble-btn inline-flex px-8 py-3">
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isCancelled = order.status === 'cancelled';
            const currentStep = isCancelled ? 0 : badge.stepIndex;

            return (
              <div 
                key={order._id || order.id} 
                className="bg-bubble-surface border border-border-main rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Top Row: Order ID, Date, Amount & Status */}
                <div className="flex flex-wrap justify-between items-center gap-4 pb-5 border-b border-border-main">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-lg text-text-main">
                        Order #{order.orderNumber || (order._id || order.id || '').slice(-6).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badge.color}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                      <Calendar size={13} />
                      <span>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{order.OrderItems?.length || 0} {order.OrderItems?.length === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-text-muted">Total Payable</div>
                      <div className="text-xl font-black text-primary">₹{order.totalAmount?.toFixed(2)}</div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailModalOpen(true);
                      }}
                      className="bubble-btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Visual Order Progress Stepper */}
                <div className="py-6 px-2 sm:px-6">
                  {isCancelled ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-2xl p-4 flex items-center gap-3">
                      <XCircle size={22} className="shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Order Cancelled</p>
                        <p className="text-xs opacity-90 mt-0.5">This order has been cancelled. If you have questions, please reach out to customer support.</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-4 relative">
                        {/* Connecting track line */}
                        <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-border-main -z-0">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ 
                              width: currentStep <= 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%' 
                            }}
                          />
                        </div>

                        {trackingSteps.map((step, idx) => {
                          const stepNum = idx + 1;
                          const isDone = currentStep >= stepNum;
                          const isCurrent = currentStep === stepNum;

                          return (
                            <div key={idx} className="flex flex-col items-center text-center relative z-10">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                                  isDone 
                                    ? 'bg-primary text-white scale-105 shadow-primary/30' 
                                    : 'bg-bubble-input text-text-muted border border-border-main'
                                }`}
                              >
                                {isDone ? <CheckCircle size={16} /> : stepNum}
                              </div>
                              <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-primary' : isDone ? 'text-text-main' : 'text-text-muted'}`}>
                                {step.title}
                              </span>
                              <span className="hidden sm:block text-[11px] text-text-muted mt-0.5 max-w-[90px]">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Preview Grid */}
                <div className="pt-4 border-t border-border-main flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {order.OrderItems?.slice(0, 4).map((it, idx) => {
                      const img = it.Product?.imageUrl || it.Product?.media?.[0] || 'https://via.placeholder.com/80';
                      return (
                        <div key={idx} className="flex items-center gap-2.5 bg-bubble-input px-3 py-1.5 rounded-2xl border border-border-main shrink-0">
                          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white shrink-0">
                            <Image 
                              src={img} 
                              alt={it.name} 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-text-main truncate max-w-[140px]">{it.name}</p>
                            <p className="text-[11px] text-text-muted">
                              {it.color && <span className="font-bold text-primary mr-1">({it.color})</span>}
                              Qty: {it.quantity} × ₹{it.price}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {order.OrderItems?.length > 4 && (
                      <span className="text-xs font-bold text-text-muted px-2">
                        +{order.OrderItems.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-text-muted flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary" />
                    <span>Delivering to: <strong className="text-text-main">{order.shippingCity || 'Direct Location'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED ORDER MODAL */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border-main">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border-main">
              <div>
                <h3 className="text-2xl font-black text-text-main">
                  Order Details
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  #{selectedOrder.orderNumber || (selectedOrder._id || selectedOrder.id || '').slice(-6).toUpperCase()} • {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="p-2 bg-bubble-input text-text-muted hover:text-text-main rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">
              {/* Order Status Tracker inside Modal */}
              <div className="bg-bubble-input p-4 rounded-2xl border border-border-main">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Live Status</span>
                  {(() => {
                    const b = getStatusBadge(selectedOrder.status);
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${b.color}`}>
                        {b.icon}
                        {b.label}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {selectedOrder.status === 'pending' && 'Your order has been recorded. Our support team will contact you to verify details before dispatch.'}
                  {selectedOrder.status === 'confirmed' && 'Your order is confirmed and currently being packed at our facility.'}
                  {selectedOrder.status === 'shipped' && 'Your package has been dispatched and is currently on its way to your destination.'}
                  {selectedOrder.status === 'delivered' && 'Your package has been safely delivered. Thank you for shopping with PlaycastHub!'}
                  {selectedOrder.status === 'completed' && 'Order completed successfully.'}
                  {selectedOrder.status === 'cancelled' && 'This order has been cancelled.'}
                </p>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">
                  Ordered Products ({selectedOrder.OrderItems?.length || 0})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.OrderItems?.map((item, idx) => {
                    const img = item.Product?.imageUrl || item.Product?.media?.[0] || 'https://via.placeholder.com/100';
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-bubble-input rounded-2xl border border-border-main">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0">
                            <Image src={img} alt={item.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-text-main">{item.name}</p>
                            {item.color && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary mt-0.5 mb-1">
                                Color: {item.color}
                              </span>
                            )}
                            <p className="text-xs text-text-muted">Quantity: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-right font-black text-text-main text-sm">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bubble-input p-4 rounded-2xl border border-border-main">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                    <MapPin size={15} />
                    <span>Shipping Address</span>
                  </div>
                  <p className="text-xs text-text-main font-medium leading-relaxed">
                    {selectedOrder.shippingAddressLine1 || 'Direct Pickup / Counter'}<br />
                    {selectedOrder.shippingAddressLine2 && <>{selectedOrder.shippingAddressLine2}<br /></>}
                    {selectedOrder.shippingCity ? `${selectedOrder.shippingCity}, ` : ''}
                    {selectedOrder.shippingState ? `${selectedOrder.shippingState} ` : ''}
                    {selectedOrder.shippingPincode ? `- ${selectedOrder.shippingPincode}` : ''}
                  </p>
                </div>

                <div className="bg-bubble-input p-4 rounded-2xl border border-border-main">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                    <FileText size={15} />
                    <span>Payment Information</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Payment Method:</span>
                      <span className="font-bold text-text-main">{selectedOrder.paymentMethod || 'Cash on Delivery (COD)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Payment Status:</span>
                      <span className="font-bold uppercase text-primary">{selectedOrder.paymentStatus || 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-bubble-input p-4 rounded-2xl border border-border-main space-y-2">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Delivery Charges:</span>
                  <span className="text-emerald-500 font-bold">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border-main text-base font-black text-primary">
                  <span>Total Amount Paid / Payable:</span>
                  <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-border-main flex justify-end">
              <button 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedOrder(null);
                }} 
                className="bubble-btn py-2.5 px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
