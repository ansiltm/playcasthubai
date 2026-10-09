'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Trash2, Plus, Minus, ArrowRight, MapPin, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import dynamic from 'next/dynamic';

const CheckoutMap = dynamic(() => import('../../components/CheckoutMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-bubble-bg animate-pulse rounded-2xl flex items-center justify-center text-text-muted">Loading map...</div>
});

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [address, setAddress] = useState(user?.address || '');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'online'>('COD');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user && step === 'shipping') {
      setPincode(user.pincode || '');
      setAddress(user.address || '');
      if (user.pincode) fetchLocation(user.pincode);
    }
  }, [user, step]);

  const fetchLocation = async (code: string) => {
    if (!code) return;
    setLoadingLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${code}&format=json&countrycodes=in`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCoordinates({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        toast.success('Location found!');
      } else {
        toast.error('Could not find location for this pincode');
        setCoordinates(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }
    
    setIsProcessing(true);

    // Simulate payment processing delay if online payment
    if (paymentMethod === 'online') {
      toast.loading('Processing payment securely...', { duration: 2000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      await api.post('/orders', { 
        items,
        paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
        latitude: coordinates?.lat,
        longitude: coordinates?.lng
      });
      toast.success('Order placed successfully!');
      clearCart();
      setStep('success');
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.message || 'Checkout failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
        <h1 className="text-4xl font-black text-text-main mb-4">Order Confirmed!</h1>
        <p className="text-xl text-text-muted mb-8 max-w-lg">
          Thank you for your purchase. We have sent an order confirmation and receipt to your registered email address.
        </p>
        <Link href="/products" className="bubble-btn">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-black text-text-main mb-4">Your Cart is Empty</h1>
        <p className="text-text-muted mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Discover our amazing collection of RC cars and toys.</p>
        <Link href="/" className="bubble-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-text-main mb-8">
        {step === 'cart' ? 'Shopping Cart' : step === 'shipping' ? 'Shipping & Location' : 'Payment Integration'}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {step === 'cart' && (
            items.map((item) => (
              <div key={item.productId} className="bubble-card bg-bubble-surface p-6 flex flex-col sm:flex-row items-center gap-6">
                <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded-2xl bg-bubble-bg" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-text-main mb-2">{item.name}</h3>
                  <div className="text-2xl font-black text-primary">₹{item.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-bubble-bg rounded-full border border-gray-200">
                    <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="p-3 text-text-muted hover:text-primary transition-colors"><Minus size={16} /></button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-3 text-text-muted hover:text-primary transition-colors"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="p-3 text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors"><Trash2 size={20} /></button>
                </div>
              </div>
            ))
          )}

          {step === 'shipping' && (
            <div className="bubble-card bg-bubble-surface p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><MapPin className="text-primary"/> Delivery Location</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Delivery Address</label>
                  <textarea 
                    value={address} onChange={(e) => setAddress(e.target.value)}
                    className="bubble-input w-full min-h-[100px]" placeholder="Enter full address..."
                  />
                </div>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-text-muted mb-2">Postal Code (Pincode)</label>
                    <input 
                      type="text" value={pincode} onChange={(e) => setPincode(e.target.value)}
                      className="bubble-input w-full" placeholder="e.g. 682001"
                    />
                  </div>
                  <button onClick={() => fetchLocation(pincode)} disabled={loadingLocation || !pincode} className="bubble-btn whitespace-nowrap">
                    {loadingLocation ? 'Locating...' : 'Verify Location'}
                  </button>
                </div>
              </div>
              
              {coordinates && (
                <div className="mt-6 rounded-2xl overflow-hidden border-2 border-primary/20">
                  <CheckoutMap lat={coordinates.lat} lng={coordinates.lng} />
                  <div className="bg-primary/10 p-3 text-sm font-bold text-primary text-center">
                    Location pinned successfully! Coordinates saved.
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'payment' && (
            <div className="bubble-card bg-bubble-surface p-8 space-y-6">
              <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>
              
              <label className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border-main hover:border-primary/50'}`}>
                <div className="flex items-center gap-4">
                  <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-5 h-5 text-primary" />
                  <CreditCard className={paymentMethod === 'online' ? 'text-primary' : 'text-text-muted'} size={32} />
                  <div>
                    <div className="font-bold text-lg">Pay Online (Card / UPI)</div>
                    <div className="text-sm text-text-muted">Instant, secure & fully functional test payment.</div>
                  </div>
                </div>
                {paymentMethod === 'online' && (
                  <div className="mt-4 pt-4 border-t border-border-main">
                    <div className="bg-gray-100 p-4 rounded-xl text-center text-sm font-bold text-gray-500 mb-3">
                      Mock Payment Gateway (Test Mode)
                    </div>
                    <div className="space-y-3">
                      <input type="text" placeholder="Card Number (Test: 4242 4242 4242)" className="bubble-input w-full" defaultValue="4242 4242 4242 4242" />
                      <div className="flex gap-3">
                        <input type="text" placeholder="MM/YY" className="bubble-input w-1/2" defaultValue="12/28" />
                        <input type="text" placeholder="CVC" className="bubble-input w-1/2" defaultValue="123" />
                      </div>
                    </div>
                  </div>
                )}
              </label>

              <label className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border-main hover:border-primary/50'}`}>
                <div className="flex items-center gap-4">
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 text-primary" />
                  <Banknote className={paymentMethod === 'COD' ? 'text-primary' : 'text-text-muted'} size={32} />
                  <div>
                    <div className="font-bold text-lg">Cash on Delivery</div>
                    <div className="text-sm text-text-muted">Pay when your order arrives.</div>
                  </div>
                </div>
              </label>
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
                <span>Shipping</span>
                <span className="font-bold text-text-main">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-bold text-text-main">₹{(getTotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl">
                <span className="font-black text-text-main">Total</span>
                <span className="font-black text-primary">₹{(getTotal() * 1.1).toFixed(2)}</span>
              </div>
            </div>
            
            {step === 'cart' && (
              <button onClick={() => setStep('shipping')} className="bubble-btn w-full flex items-center justify-center space-x-2 py-4">
                <span>Proceed to Shipping</span> <ArrowRight size={20} />
              </button>
            )}
            {step === 'shipping' && (
              <button onClick={() => setStep('payment')} disabled={!coordinates} className="bubble-btn w-full flex items-center justify-center space-x-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                <span>Continue to Payment</span> <ArrowRight size={20} />
              </button>
            )}
            {step === 'payment' && (
              <button onClick={handleCheckoutSubmit} disabled={isProcessing} className="bubble-btn w-full flex items-center justify-center space-x-2 py-4">
                <span>{isProcessing ? 'Processing...' : `Pay ₹${(getTotal() * 1.1).toFixed(2)}`}</span>
              </button>
            )}

            {step !== 'cart' && (
              <button onClick={() => setStep(step === 'payment' ? 'shipping' : 'cart')} className="w-full mt-4 text-center font-bold text-text-muted hover:text-primary transition-colors">
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
