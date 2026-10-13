'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Filter, ShoppingBag, X, Search, ChevronDown, Shirt } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let url = '/api/products?';
        if (selectedCategories.length > 0) {
          url += `categories=${selectedCategories.join(',')}&`;
        }
        if (selectedSizes.length > 0) {
          url += `sizes=${selectedSizes.join(',')}&`;
        }
        if (selectedPrice) {
          url += `priceRange=${selectedPrice}&`;
        }
        url += `sort=${sortBy}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategories, selectedSizes, selectedPrice, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Parse arrays
    const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes || ['M'];
    const colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors || ['Black'];
    const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: sizes[0],
      color: colors[0],
      image: images[0] || ''
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="page-container">
          <h1 className="text-4xl font-bold font-poppins mb-4">Our Collection</h1>
          <p className="text-gray-600">Discover your next favorite T-shirt from our premium selections.</p>
        </div>
      </div>

      <div className="page-container py-8 flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 font-medium"
          >
            <Filter size={20} /> Filters
          </button>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border-none bg-transparent font-medium outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="name-asc">Name A-Z</option>
          </select>
        </div>

        {/* Sidebar Filters */}
        <aside className={`
          fixed inset-0 z-50 bg-white p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:z-0 md:bg-transparent md:p-0 md:w-64 md:shrink-0
          ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold font-poppins">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)}><X size={24} /></button>
          </div>

          <div className="space-y-8">
            {/* Category Filter */}
            <div>
              <h3 className="font-bold mb-4 flex items-center justify-between">Category</h3>
              <div className="space-y-3">
                {['Men', 'Women', 'Kids', 'Unisex'].map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span className="text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <h3 className="font-bold mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`w-10 h-10 rounded border flex items-center justify-center text-sm font-medium transition-colors ${
                      selectedSizes.includes(size) 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="font-bold mb-4">Price</h3>
              <div className="space-y-2">
                {[
                  { label: 'All Prices', val: '' },
                  { label: 'Under $25', val: 'under-25' },
                  { label: '$25 - $35', val: '25-35' },
                  { label: '$35 - $50', val: '35-50' },
                  { label: 'Over $50', val: 'over-50' }
                ].map(range => (
                  <label key={range.val} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="price"
                      className="w-4 h-4 text-brand-500 focus:ring-brand-500"
                      checked={selectedPrice === range.val}
                      onChange={() => setSelectedPrice(range.val)}
                    />
                    <span className="text-gray-700">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Bar Desktop */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <p className="text-gray-600 font-medium">Showing {products.length} products</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Sort by:</span>
              <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 outline-none focus:border-brand-500 font-medium cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="name-asc">Name A-Z</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="card animate-pulse">
                  <div className="h-72 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold font-poppins mb-2">No products found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">We couldn't find any products matching your current filters. Try adjusting your search criteria.</p>
              <button 
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSizes([]);
                  setSelectedPrice('');
                }}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => {
                const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                const imgUrl = images && images.length > 0 ? images[0] : null;

                return (
                  <Link href={`/product/${product.id}`} key={product.id} className="card card-hover group flex flex-col h-full bg-white">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-gray-100">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Shirt size={48} />
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.category && (
                          <span className="badge bg-white text-black shadow-sm text-xs font-bold px-2 py-1">
                            {product.category}
                          </span>
                        )}
                        {/* Fake sale badge logic */}
                        {product.price < 30 && (
                          <span className="badge bg-brand-500 text-white shadow-sm text-xs font-bold px-2 py-1">
                            SALE
                          </span>
                        )}
                      </div>

                      {/* Quick Add Button overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                        <button 
                          onClick={(e) => handleAddToCart(e, product)}
                          className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingBag size={18} /> Add to Cart
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-semibold text-lg mb-1 truncate text-gray-900 group-hover:text-brand-500 transition-colors">{product.name}</h3>
                      <div className="mt-auto pt-2 flex items-center gap-2">
                        <span className="font-bold text-lg text-black">{formatPrice(product.price)}</span>
                        {product.price < 30 && (
                          <span className="text-sm text-gray-500 line-through">{formatPrice(product.price * 1.3)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
