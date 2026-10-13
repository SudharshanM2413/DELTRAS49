'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Truck, Shield, Sparkles, Shirt } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

export default function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products?featured=true');
        if (res.ok) {
          const data = await res.json();
          setFeaturedProducts(data.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        <div className="page-container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold font-poppins mb-6 leading-tight">
              Design Your <span className="text-brand-500">Perfect</span> T-Shirt
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-lg">
              Premium quality apparel meets limitless creativity. Shop our exclusive collections or start designing your own custom masterpiece today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary flex items-center gap-2">
                Shop Collection <ArrowRight size={20} />
              </Link>
              <Link href="/customize" className="btn-secondary bg-white text-black hover:bg-gray-100 flex items-center gap-2">
                Start Designing <Sparkles size={20} />
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center items-center animate-slide-up">
            {/* CSS T-Shirt shape */}
            <div className="relative w-64 h-72 lg:w-80 lg:h-96 bg-brand-500 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] flex items-center justify-center transform hover:rotate-3 transition-transform duration-500">
               <div className="absolute top-0 w-32 h-10 bg-black rounded-b-full shadow-inner"></div>
               <div className="absolute top-10 left-[-20px] w-12 h-24 bg-brand-500 rounded-lg transform -rotate-12"></div>
               <div className="absolute top-10 right-[-20px] w-12 h-24 bg-brand-500 rounded-lg transform rotate-12"></div>
               <Shirt size={100} className="text-white opacity-20 absolute" />
               <Image
                 src="/DELTA1.png"
                 alt="DELTRAS logo"
                 width={240}
                 height={140}
                 className="relative z-10 w-[70%] h-auto object-contain rotate-[-5deg]"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find the perfect fit for everyone</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Men', 'Women', 'Kids', 'Unisex'].map((cat) => (
              <Link href={`/shop?category=${cat}`} key={cat} className="card card-hover group overflow-hidden relative h-64 bg-white flex flex-col justify-end p-6 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                    <Shirt size={64} className="opacity-50" />
                  </div>
                </div>
                <div className="relative z-20">
                  <h3 className="text-2xl font-bold text-white mb-2">{cat}</h3>
                  <span className="text-brand-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20">
        <div className="page-container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Trending Now</h2>
              <p className="section-subtitle">Our most popular designs this week</p>
            </div>
            <Link href="/shop" className="text-brand-500 font-semibold hover:underline hidden sm:block">
              View All Products
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
                const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                return (
                <Link href={`/product/${product.id}`} key={product.id} className="card card-hover group">
                  <div className="relative h-64 overflow-hidden rounded-t-2xl bg-gray-100">
                    {images && images.length > 0 ? (
                      <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Shirt size={48} />
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-3 right-3 badge bg-red-500 text-white">Out of Stock</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                      {product.price < 30 && <span className="text-sm text-gray-500 line-through">{formatPrice(product.price * 1.2)}</span>}
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop" className="btn-secondary w-full">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-black text-white">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="mx-auto w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mb-6">
                <Star className="text-brand-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 font-poppins">Premium Quality</h3>
              <p className="text-gray-400">Crafted with the finest organic cotton for ultimate comfort and durability.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mb-6">
                <Shield className="text-brand-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 font-poppins">Secure Checkout</h3>
              <p className="text-gray-400">Your payments are safe and encrypted with industry-leading security.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mb-6">
                <Truck className="text-brand-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 font-poppins">Fast & Free Shipping</h3>
              <p className="text-gray-400">Enjoy free shipping on all orders over $50. Delivered right to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="section-title">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", text: "The custom t-shirt I ordered came out exactly as I envisioned. The print quality is amazing!", rating: 5 },
              { name: "Mike T.", text: "Super soft fabric and perfect fit. I've already bought three more shirts from the summer collection.", rating: 5 },
              { name: "Elena R.", text: "Fast shipping and great customer service. DELTRAS49 is my new go-to for casual wear.", rating: 4 }
            ].map((testimonial, idx) => (
              <div key={idx} className="card p-8 bg-white">
                <div className="flex gap-1 text-brand-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < testimonial.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
                <p className="font-bold font-poppins">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="page-container">
          <div className="bg-brand-500 rounded-2xl p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Join the DELTRAS49 Club</h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">Subscribe to our newsletter and get 15% off your first order, plus exclusive access to new drops.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" className="input-field text-black flex-1" required />
              <button type="submit" className="btn-secondary bg-black hover:bg-gray-900 border-none text-white">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
