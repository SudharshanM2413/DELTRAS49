'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, CreditCard, User, Package, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import { Order, OrderStatus } from '@/types';

export default function AdminOrderDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setStatus(data.status);
        } else {
          toast.error('Order not found');
          router.push('/admin/orders');
        }
      } catch (error) {
        toast.error('Error fetching order');
        router.push('/admin/orders');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id, router]);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('Order status updated');
        setOrder(prev => prev ? { ...prev, status: status as OrderStatus } : null);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !order) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  }

  const shippingCost = order.shippingCost ?? order.shipping ?? 0;
  const totalAmount = order.totalAmount ?? order.total ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-poppins text-gray-900 flex items-center gap-3">
              Order #{order.id.slice(-8).toUpperCase()}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium tracking-wide ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Calendar size={14} /> {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field py-2"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating || status === order.status}
            className="btn-primary py-2 whitespace-nowrap"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold font-poppins text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-brand-500" /> Order Items ({order.items.length})
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${item.productId}`} className="font-medium text-gray-900 hover:text-brand-500 transition-colors">
                      {item.productName}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1 space-x-3">
                      <span>Size: <strong className="text-gray-900">{item.size}</strong></span>
                      <span>Color: <strong className="text-gray-900">{item.color}</strong></span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Customer Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold font-poppins text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-brand-500" /> Customer Information
            </h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-500 block mb-1">Name</span><span className="font-medium text-gray-900">{order.customerName}</span></p>
              <p><span className="text-gray-500 block mb-1">Email</span><a href={`mailto:${order.customerEmail}`} className="font-medium text-brand-500 hover:underline">{order.customerEmail}</a></p>
              <p><span className="text-gray-500 block mb-1">Phone</span><span className="font-medium text-gray-900">{order.customerPhone}</span></p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold font-poppins text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-brand-500" /> Shipping Address
            </h2>
            <div className="text-sm text-gray-700 space-y-1 bg-gray-50 p-4 rounded-lg">
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold font-poppins text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-brand-500" /> Payment Details
            </h2>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  order.paymentStatus === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Payment ID</span>
                <span className="font-medium font-mono text-xs">{order.paymentId || 'N/A'}</span>
              </p>
            </div>
          </div>
          
          {order.notes && (
            <div className="card p-6">
              <h2 className="text-lg font-bold font-poppins text-gray-900 mb-3">Order Notes</h2>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
