'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Trash2, Plus, Minus, ArrowRight, MapPin, CheckCircle, PhoneCall, X, ShoppingBag, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { externalApi } from '../../lib/externalApi';

export default function CartPage() {
  const router = useRouter();
  const checkoutKey = useRef<string | null>(null);
  const submitting = useRef(false);
  const checkoutSignature = useRef('');
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [step, setStep] = useState<'cart' | 'shipping'>('cart');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone && user.phone !== '0000000000' ? user.phone : '');
      setPincode(user.pincode || '');
      setAddressLine1(user.addressLine1 || '');
      setAddressLine2(user.addressLine2 || '');
      setCity(user.city || '');
      setState(user.state || '');
    }
  }, [user]);

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPincode(val);
    
    if (val.length === 6) {
      try {
        const { data } = await externalApi.get(`https://api.postalpincode.in/pincode/${val}`);
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.District);
          setState(postOffice.State);
          toast.success('City and State auto-filled!');
        } else {
          toast.error('Invalid Pincode');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenConfirm = () => {
    if (!user) {
      toast.error('Please login to place an order');
      router.push('/login');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please provide a valid contact phone number');
      return;
    }
    if (!addressLine1.trim() || !pincode.trim() || !city.trim() || !state.trim()) {
      toast.error('Please fill in your delivery address');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalOrderSubmit = async () => {
    if (submitting.current) return;
    submitting.current = true;
    const signature = JSON.stringify({items, fullName, phone, addressLine1, addressLine2, city, state, pincode});
    if (!checkoutKey.current || checkoutSignature.current !== signature) { checkoutKey.current = crypto.randomUUID(); checkoutSignature.current = signature; }
    setIsProcessing(true);

    try {
      const res = await api.post('/orders', { 
        items,
        name: fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode
      }, { headers: { 'Idempotency-Key': checkoutKey.current } });
      
      const orderNumber = res.data.orderNumber;
      setConfirmedOrderNumber(orderNumber);
      clearCart();
      checkoutKey.current = null;
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      toast.success('Order received!');
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
      submitting.current = false;
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.push('/products');
  };

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-bubble-bg rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-text-main mb-4">Your Cart is Empty</h1>
        <p className="text-text-muted mb-8 max-w-md">Discover our amazing collection of RC cars, toys, and hobby collectibles.</p>
        <Link href="/products" className="bubble-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  const isFormValid = Boolean(fullName && phone && addressLine1 && pincode && city && state);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-text-main mb-8">
        {step === 'cart' ? 'Shopping Cart' : 'Delivery Details'}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {step === 'cart' && (
            items.map((item) => {
              const itemKey = item.id || item.productId;
              return (
                <div key={itemKey} className="bubble-card bg-bubble-surface p-6 flex flex-col sm:flex-row items-center gap-6">
                  <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded-2xl bg-bubble-bg" />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-text-main mb-1">{item.name}</h3>
                    {item.color && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
                        <span>Color:</span>
                        <span className="font-black">{item.color}</span>
                      </div>
                    )}
                    <div className="text-2xl font-black text-primary">₹{item.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-bubble-bg rounded-full border border-gray-200">
                      <button onClick={() => updateQuantity(itemKey, Math.max(1, item.quantity - 1))} className="p-3 text-text-muted hover:text-primary transition-colors" aria-label="Decrease quantity"><Minus size={16} /></button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(itemKey, item.quantity + 1)} className="p-3 text-text-muted hover:text-primary transition-colors" aria-label="Increase quantity"><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removeItem(itemKey)} className="p-3 text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors" aria-label="Remove item"><Trash2 size={20} /></button>
                  </div>
                </div>
              );
            })
          )}

          {step === 'shipping' && (
            <div className="bubble-card bg-bubble-surface p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <MapPin className="text-primary"/> Customer & Delivery Info
                </h2>
                <p className="text-sm text-text-muted">
                  Our customer support team will call this phone number to verify and confirm your order before dispatch.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="bubble-input w-full" 
                    placeholder="Your Full Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Phone Number for Order Call *</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="bubble-input w-full" 
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-border-main">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Postal Code (Pincode) *</label>
                  <input 
                    type="text" 
                    maxLength={6} 
                    value={pincode} 
                    onChange={handlePincodeChange}
                    className="bubble-input w-full" 
                    placeholder="e.g. 682001 (Auto-fills City & State)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Address Line 1 (House/Building/Street) *</label>
                  <input 
                    type="text" 
                    value={addressLine1} 
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="bubble-input w-full" 
                    placeholder="House/Flat No, Building Name, Street"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Address Line 2 (Landmark/Area - Optional)</label>
                  <input 
                    type="text" 
                    value={addressLine2} 
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="bubble-input w-full" 
                    placeholder="Nearby Landmark, Locality"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">City / District *</label>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="bubble-input w-full" 
                      placeholder="City / District"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-muted mb-2">State *</label>
                    <input 
                      type="text" 
                      value={state} 
                      onChange={(e) => setState(e.target.value)}
                      className="bubble-input w-full" 
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                <PhoneCall className="text-primary w-6 h-6 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold text-text-main block">Verification via Phone Call:</span>
                  <span className="text-text-muted">No advance payment needed. When you click place order, our executive will contact you to verify details before shipping.</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bubble-card bg-bubble-surface p-8 sticky top-24">
            <h2 className="text-2xl font-black text-text-main mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 text-text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-text-main">₹{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery charge</span>
                <span className="font-bold text-text-main">Confirmed before dispatch</span>
              </div>

              <div className="border-t pt-4 flex justify-between text-xl">
                <span className="font-black text-text-main">Item total</span>
                <span className="font-black text-primary">₹{(getTotal()).toFixed(2)}</span>
              </div>
            </div>
            
            <p className="text-xs text-text-muted mb-4">Any delivery charge will be confirmed with you before dispatch.</p>
            {step === 'cart' && (
              <button onClick={() => setStep('shipping')} className="bubble-btn w-full flex items-center justify-center space-x-2 py-4">
                <span>Proceed to Delivery</span> <ArrowRight size={20} />
              </button>
            )}
            
            {step === 'shipping' && (
              <button 
                onClick={handleOpenConfirm} 
                disabled={!isFormValid} 
                className="bubble-btn w-full flex items-center justify-center space-x-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Confirm & Place Order</span> <ArrowRight size={20} />
              </button>
            )}

            {step !== 'cart' && (
              <button onClick={() => setStep('cart')} className="w-full mt-4 text-center font-bold text-text-muted hover:text-primary transition-colors">
                Back to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM ORDER POPUP MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative border border-border-main">
            <button 
              onClick={() => setShowConfirmModal(false)} 
              className="absolute top-5 right-5 p-2 bg-bubble-input text-text-muted hover:text-text-main rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-black text-text-main mb-2">Confirm Your Order</h3>
            <p className="text-sm text-text-muted mb-6">
              Please review your delivery and contact details before placing the order.
            </p>

            <div className="space-y-4 bg-bubble-input p-4 rounded-2xl mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Recipient Name:</span>
                <span className="font-bold text-text-main">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Contact Phone:</span>
                <span className="font-bold text-primary">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Delivery Address:</span>
                <span className="font-bold text-text-main text-right max-w-[60%]">
                  {addressLine1}, {addressLine2 ? `${addressLine2}, ` : ''}{city}, {state} - {pincode}
                </span>
              </div>
              <div className="flex justify-between border-t border-border-main pt-3 text-base">
                <span className="font-bold text-text-main">Item total:</span>
                <span className="font-black text-primary">₹{(getTotal()).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-3 rounded-xl text-xs mb-6 flex items-center gap-2">
              <PhoneCall size={18} className="shrink-0" />
              <div>
                <span>Our support team will contact you at <strong>{phone}</strong> after placing the order.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bubble-btn-secondary py-3 text-sm"
                disabled={isProcessing}
              >
                Edit Details
              </button>
              <button 
                onClick={handleFinalOrderSubmit}
                className="flex-1 bubble-btn py-3 text-sm justify-center"
                disabled={isProcessing}
              >
                {isProcessing ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP MODAL (User can close at their convenience) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-bubble-surface rounded-3xl shadow-2xl w-full max-w-md p-8 text-center relative border border-border-main">
            <button 
              onClick={handleCloseSuccess} 
              className="absolute top-5 right-5 p-2 bg-bubble-input text-text-muted hover:text-text-main rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={44} />
            </div>

            <h3 className="text-3xl font-black text-text-main mb-2">Order Received!</h3>
            {confirmedOrderNumber && (
              <span className="inline-block bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                #{confirmedOrderNumber}
              </span>
            )}

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <PhoneCall className="text-primary w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-text-main text-sm">Support Team Will Contact You</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Our support team will contact you on <strong className="text-primary">{phone}</strong> after placing the order to confirm your delivery details.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-text-muted mb-6">
              Please keep your phone available. You can close this popup at your convenience.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/orders" 
                onClick={handleCloseSuccess}
                className="bubble-btn w-full py-3.5 justify-center flex items-center gap-2"
              >
                <Package size={18} />
                <span>Track Order in History</span>
              </Link>
              <button 
                onClick={handleCloseSuccess}
                className="bubble-btn-secondary w-full py-3.5 justify-center"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

