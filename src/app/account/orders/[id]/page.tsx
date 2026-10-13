'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import { Order, OrderItem, Product } from '@/types';

// Extended type for frontend usage
type OrderItemWithProduct = OrderItem & {
  product: Product;
};

type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        
        if (!res.ok) {
          if (res.status === 401) router.push('/login');
          if (res.status === 404) toast.error('Order not found');
          throw new Error('Failed to fetch order');
        }
        
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-gray-500 mb-6">The order you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/account" className="btn-primary">Back to Account</Link>
      </div>
    );
  }

  const orderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStatusIndex = orderStatuses.indexOf(order.status) >= 0 ? orderStatuses.indexOf(order.status) : 0;

  return (
    <div className="page-container py-8 animate-fade-in">
      <Link href="/account" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-600 mb-6 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-gray-900 flex items-center gap-3">
            Order #{order.id.slice(-6).toUpperCase()}
            <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Clock size={16} /> Placed on {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="card p-6 mb-8 border border-gray-100">
        <div className="relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-brand-500 rounded-full z-0 transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` }}
          ></div>
          
          <div className="relative z-10 flex justify-between">
            {orderStatuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              let Icon = Clock;
              if (status === 'PROCESSING') Icon = Package;
              if (status === 'SHIPPED') Icon = Truck;
              if (status === 'DELIVERED') Icon = CheckCircle;
              
              return (
                <div key={status} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${
                    isCompleted ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-2 ring-brand-200 ring-offset-2' : ''}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`mt-2 text-xs font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold font-poppins">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => {
                const productName = item.productName || item.name || 'Product';
                const productImage = item.productImage || item.image || '/placeholder.jpg';

                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <Link href={`/product/${item.productId}`} className="text-lg font-bold text-gray-900 hover:text-brand-600 transition-colors line-clamp-1">
                        {productName}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                        {item.size && <span>Size: <strong className="text-gray-700">{item.size}</strong></span>}
                        {item.color && <span>Color: <strong className="text-gray-700">{item.color}</strong></span>}
                        <span>Qty: <strong className="text-gray-700">{item.quantity}</strong></span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 border border-gray-100">
            <h2 className="text-lg font-bold font-poppins mb-4 pb-4 border-b border-gray-100">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-medium text-gray-900">{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <span className="font-bold text-xl text-brand-600">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="card p-6 border border-gray-100">
            <h2 className="text-lg font-bold font-poppins mb-4 pb-4 border-b border-gray-100">Shipping Information</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-medium text-gray-900">{order.shippingName}</p>
                  <p className="text-gray-600 mt-1">
                    {order.shippingAddress}<br />
                    {order.shippingCity}, {order.shippingState} {order.shippingZip}<br />
                    {order.shippingCountry}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 border border-gray-100">
            <h2 className="text-lg font-bold font-poppins mb-4 pb-4 border-b border-gray-100">Payment Information</h2>
            <div className="flex items-start gap-3 text-sm">
              <CreditCard className="text-gray-400 mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-medium text-gray-900 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                <p className={`mt-1 font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
