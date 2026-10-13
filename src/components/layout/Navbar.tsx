'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Check auth
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}
    >
      {/* Top Bar */}
      <div className="bg-black text-white text-center text-sm py-2 px-4">
        <p>🎉 Free shipping on orders over $50 — <Link href="/shop" className="underline font-medium">Shop Now</Link></p>
      </div>

      <nav className="page-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="DELTRAS home">
            <div className="rounded-xl bg-black p-1.5 shadow-sm ring-1 ring-black/5">
              <Image
                src="/DELTA1.png"
                alt="DELTRAS logo"
                width={180}
                height={80}
                priority
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Home</Link>
            <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Shop</Link>
            <Link href="/customize" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1">
              <span>✨</span> Customize
            </Link>
            <Link href="/shop?category=Men" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Men</Link>
            <Link href="/shop?category=Women" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Women</Link>
            <Link href="/shop?category=Kids" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Kids</Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    Dashboard
                  </Link>
                )}
                <Link href="/account" className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-black">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:flex items-center gap-2 btn-primary text-sm !py-2 !px-4">
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-slide-down">
            <div className="flex flex-col gap-1">
              <Link href="/" className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link href="/shop" className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link href="/customize" className="px-4 py-3 text-sm font-medium text-brand-600 hover:bg-red-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>✨ Customize T-Shirt</Link>
              <Link href="/shop?category=Men" className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Men</Link>
              <Link href="/shop?category=Women" className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Women</Link>
              <Link href="/shop?category=Kids" className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Kids</Link>
              <hr className="my-2" />
              {user ? (
                <>
                  <Link href="/account" className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="px-4 py-3 text-sm font-medium text-brand-600 hover:bg-red-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="px-4 py-3 text-sm font-medium text-left text-red-600 hover:bg-red-50 rounded-lg">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  <Link href="/register" className="px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
