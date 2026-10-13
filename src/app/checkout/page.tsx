'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { CheckCircle, CreditCard, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTax, getShipping, getTotal, clearCart } = useCartStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      router.push('/cart');
    }
  }, [items, router, isSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    toast.error('Invalid promo code');
    setPromoCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedOrderId);
      setIsSuccess(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="page-container py-16 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-green-100 p-6 rounded-full mb-6 animate-scale-in">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold font-[Poppins] mb-4 text-center">Order Confirmed! 🎉</h1>
        <p className="text-gray-600 text-lg mb-2 text-center">Thank you for your purchase.</p>
        <p className="text-gray-500 mb-8 text-center bg-gray-50 px-6 py-3 rounded-lg border border-gray-200">
          Your order ID is: <span className="font-bold text-gray-900">{orderId}</span>
        </p>
        
        <div className="flex gap-4">
          <Link href="/orders" className="btn-secondary">
            View Orders
          </Link>
          <Link href="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null; // Let the useEffect handle redirect

  return (
    <div className="page-container py-12">
      <h1 className="section-title mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-grow">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Truck className="w-5 h-5 text-brand-500" /> Shipping Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="input-field" placeholder="John Doe" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" placeholder="john@example.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input-field" placeholder="+1 (555) 000-0000" />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-field" placeholder="123 Main St, Apt 4B" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="input-field" placeholder="New York" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                  <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="input-field" placeholder="NY" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                  <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="input-field" placeholder="10001" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select required name="country" value={formData.country} onChange={handleInputChange} className="input-field">
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <CreditCard className="w-5 h-5 text-brand-500" /> Payment Method
              </h2>
              
              <div className="space-y-4">
                {/* Credit Card Option */}
                <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-brand-500 bg-red-50' : 'border-gray-200 hover:border-brand-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-brand-500 focus:ring-brand-500" />
                    <span className="font-semibold text-gray-900">Credit or Debit Card</span>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-4 border-t border-red-100 space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input type="text" className="input-field" placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <input type="text" className="input-field" placeholder="MM/YY" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input type="text" className="input-field" placeholder="123" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                        <AlertCircle className="w-3 h-3" /> This is a demo. Do not enter real card details.
                      </p>
                    </div>
                  )}
                </label>

                {/* PayPal Option */}
                <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-brand-500 bg-red-50' : 'border-gray-200 hover:border-brand-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="w-4 h-4 text-brand-500 focus:ring-brand-500" />
                    <span className="font-semibold text-gray-900">PayPal</span>
                  </div>
                  {paymentMethod === 'paypal' && (
                    <p className="mt-4 text-sm text-gray-600 pl-7 animate-fade-in">
                      You will be redirected to PayPal to complete your purchase securely.
                    </p>
                  )}
                </label>

                {/* COD Option */}
                <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-brand-500 bg-red-50' : 'border-gray-200 hover:border-brand-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-brand-500 focus:ring-brand-500" />
                    <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <p className="mt-4 text-sm text-gray-600 pl-7 animate-fade-in">
                      Pay with cash when your order arrives.
                    </p>
                  )}
                </label>
                
                {/* UPI Option */}
                <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-brand-500 bg-red-50' : 'border-gray-200 hover:border-brand-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-4 h-4 text-brand-500 focus:ring-brand-500" />
                    <span className="font-semibold text-gray-900">UPI</span>
                  </div>
                  {paymentMethod === 'upi' && (
                    <div className="mt-4 pt-4 border-t border-red-100 animate-fade-in">
                      <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                      <input type="text" className="input-field" placeholder="username@upi" />
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <div className="md:hidden">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-lg font-bold flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </span>
                ) : (
                  `Place Order • ${formatPrice(getTotal())}`
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 font-[Poppins] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Order Summary
            </h2>
            
            <div className="max-h-64 overflow-y-auto mb-6 pr-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="relative">
                    <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 object-cover rounded bg-gray-100" />
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      {item.size} • <span className="w-3 h-3 inline-block rounded-full border border-gray-300" style={{ backgroundColor: item.color }}></span>
                    </p>
                    <p className="text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Promo Code */}
            <div className="flex gap-2 mb-6 border-y border-gray-100 py-4">
              <input 
                type="text" 
                value={promoCode} 
                onChange={(e) => setPromoCode(e.target.value)} 
                placeholder="Promo code" 
                className="input-field py-2"
              />
              <button onClick={handleApplyPromo} type="button" className="btn-secondary py-2 px-4 shrink-0">
                Apply
              </button>
            </div>
            
            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-medium text-gray-900">{formatPrice(getTax())}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">
                  {getShipping() === 0 ? <span className="text-green-600">Free</span> : formatPrice(getShipping())}
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl">{formatPrice(getTotal())}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <button 
                form="checkout-form"
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-lg font-bold flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </span>
                ) : (
                  `Place Order`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
