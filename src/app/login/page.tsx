'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Shirt } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      toast.success('Login successful!');
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
        router.push(redirect);
      } else if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@threadcraft.com');
    setPassword('admin123');
  };

  const handleDemoCustomer = () => {
    setEmail('john@example.com');
    setPassword('customer123');
  };

  return (
    <div className="page-container flex items-center justify-center min-h-[calc(100vh-200px)] py-12 animate-fade-in">
      <div className="card w-full max-w-md p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-500 text-white p-3 rounded-full mb-4">
            <Shirt size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">DELTRAS49</h1>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input-field w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input-field w-full pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center py-2.5"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">
              Register
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-500 text-center mb-4">Demo Login</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Login as Admin
            </button>
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Login as Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
