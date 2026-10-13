'use client';

import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getSubtotal, getTax, getShipping, getItemCount } = useCartStore();

  const handleRemove = (id: string) => {
    removeItem(id);
    toast.success('Item removed from cart');
  };

  const handleQuantity = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] py-12">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingCart className="w-16 h-16 text-gray-400" />
        </div>
        <h1 className="section-title mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our collection and find something you'll love!
        </p>
        <Link href="/shop" className="btn-primary flex items-center gap-2">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-12">
      <h1 className="section-title mb-8">Shopping Cart ({getItemCount()} {getItemCount() === 1 ? 'item' : 'items'})</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-grow">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 flex items-center gap-6 w-full">
                    <img 
                      src={item.image || 'https://via.placeholder.com/150'} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex flex-col">
                      <Link href={`/product/${item.productId}`} className="font-semibold text-lg hover:text-brand-500 transition-colors">
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          Size: <span className="font-medium text-gray-900">{item.size}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          Color: 
                          <span className="flex items-center gap-1">
                            <span 
                              className="w-4 h-4 rounded-full border border-gray-300 inline-block" 
                              style={{ backgroundColor: item.color }}
                              title={item.color}
                            />
                            <span className="font-medium text-gray-900 uppercase">{item.color}</span>
                          </span>
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 mt-3 w-fit transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center font-medium w-full md:w-auto flex justify-between md:block mt-4 md:mt-0">
                    <span className="md:hidden text-gray-500">Price:</span>
                    {formatPrice(item.price)}
                  </div>
                  
                  <div className="col-span-2 flex justify-center w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => handleQuantity(item.id, item.quantity, -1)}
                        className="px-3 py-2 hover:bg-gray-100 text-gray-600 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium bg-white text-center min-w-[3rem]">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleQuantity(item.id, item.quantity, 1)}
                        className="px-3 py-2 hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-right font-bold text-lg w-full md:w-auto flex justify-between md:block mt-4 md:mt-0">
                    <span className="md:hidden text-gray-500 font-normal">Total:</span>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6 font-[Poppins]">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-medium text-gray-900">{formatPrice(getTax())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">
                  {getShipping() === 0 ? <span className="text-green-600">Free</span> : formatPrice(getShipping())}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl">{formatPrice(getTotal())}</span>
                </div>
                {getShipping() > 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    Add {formatPrice(50 - getSubtotal())} more for free shipping
                  </p>
                )}
              </div>
            </div>
            
            <Link href="/checkout" className="btn-primary w-full flex justify-center items-center gap-2 py-4 text-lg">
              Proceed to Checkout
            </Link>
            
            <div className="mt-6 text-center">
              <Link href="/shop" className="text-brand-500 hover:text-brand-600 font-medium inline-flex items-center gap-1 transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
