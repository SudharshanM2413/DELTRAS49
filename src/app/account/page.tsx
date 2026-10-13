'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Settings, CreditCard, Calendar, Loader2, Save, ArrowRight, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import { Order } from '@/types';
import type { User as UserType } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        
        if (!res.ok) {
          router.push('/login');
          return;
        }
        
        const data = await res.json();
        setUser(data.user);
        setProfileData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          city: data.user.city || '',
          state: data.user.state || '',
          zipCode: data.user.zip || '',
          country: data.user.country || ''
        });

        // Fetch orders
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (error) {
        toast.error('Failed to load account details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      
      toast.success('Profile updated successfully');
      const updatedUser = await res.json();
      setUser(updatedUser.user);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!user) return null;

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="page-container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-2xl shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-poppins text-gray-900">Hello, {user.name}!</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </div>
        <div className="card p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(totalSpent)}</p>
          </div>
        </div>
        <div className="card p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Member Since</p>
            <p className="text-xl font-bold text-gray-900">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package size={18} /> My Orders
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={18} /> Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'settings' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings size={18} /> Settings
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold font-poppins mb-6">Order History</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">Looks like you haven't made your first purchase yet.</p>
                  <Link href="/products" className="btn-primary inline-flex items-center gap-2">
                    Start Shopping <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm border-y border-gray-200">
                        <th className="py-3 px-4 font-medium">Order ID</th>
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                        <th className="py-3 px-4 font-medium">Total</th>
                        <th className="py-3 px-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</td>
                          <td className="py-4 px-4 text-gray-600">{formatDate(order.createdAt)}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium">{formatPrice(order.total)}</td>
                          <td className="py-4 px-4 text-right">
                            <Link href={`/account/orders/${order.id}`} className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium">
                              <Eye size={16} /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold font-poppins mb-6">Personal Information</h2>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="input-field w-full" 
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Read Only)</label>
                    <input 
                      type="email" 
                      className="input-field w-full bg-gray-50 text-gray-500 cursor-not-allowed" 
                      value={user.email}
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      className="input-field w-full" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold font-poppins mt-8 mb-4 border-t pt-6">Shipping Address</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input 
                    type="text" 
                    className="input-field w-full" 
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      className="input-field w-full" 
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    <input 
                      type="text" 
                      className="input-field w-full" 
                      value={profileData.state}
                      onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code</label>
                    <input 
                      type="text" 
                      className="input-field w-full" 
                      value={profileData.zipCode}
                      onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input 
                    type="text" 
                    className="input-field w-full md:w-1/3" 
                    value={profileData.country}
                    onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
                    {savingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md">
              <h2 className="text-xl font-bold font-poppins mb-6">Change Password</h2>
              <form onSubmit={handlePasswordSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    className="input-field w-full" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    className="input-field w-full" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="input-field w-full" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={savingPassword} className="btn-primary w-full flex justify-center items-center gap-2">
                    {savingPassword ? <Loader2 className="animate-spin" size={18} /> : null}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
