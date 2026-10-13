'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Package, Eye, Plus, ArrowRight } from 'lucide-react';
import { formatPrice, getStatusColor } from '@/lib/utils';
import { Order } from '@/types';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    monthlyRevenue: [],
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats');
        
        if (statsRes.ok) {
          const { stats: statsData } = await statsRes.json();
          setStats(statsData);
          setRecentOrders(statsData.recentOrders);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Total Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  const maxVal = Math.max(...stats.monthlyRevenue.map((month) => month.revenue), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back to your admin dashboard.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Add Product</span>
          </Link>
          <Link href="/admin/orders" className="btn-secondary flex items-center gap-2">
            <ShoppingBag size={18} />
            <span>All Orders</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6 flex items-center gap-4">
            <div className={`p-4 rounded-full ${stat.bgColor} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Placeholder */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.monthlyRevenue.map(({ month, revenue }) => (
              <div key={month} className="w-full flex flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                  {formatPrice(revenue)}
                </div>
                {/* Bar */}
                <div 
                  className="w-full bg-brand-500/20 group-hover:bg-brand-500 rounded-t-sm transition-colors duration-300"
                  style={{ height: `${(revenue / maxVal) * 100}%` }}
                ></div>
                {/* Label */}
                <span className="text-xs text-gray-400 font-medium hidden sm:block">
                  {new Date(`${month}-01T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-brand-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent orders found.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{formatPrice(order.totalAmount ?? order.total ?? 0)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
