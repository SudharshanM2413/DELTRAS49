'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, Truck, Shield, RotateCcw, Minus, Plus, ShoppingBag, Palette, ChevronRight, Check, Shirt } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection states
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          
          // Set initial selections
          const images = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
          const sizes = typeof data.sizes === 'string' ? JSON.parse(data.sizes) : data.sizes;
          const colors = typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors;
          
          if (images?.length) setSelectedImage(images[0]);
          if (sizes?.length) setSelectedSize(sizes[0]);
          if (colors?.length) setSelectedColor(colors[0]);

          // Fetch related (just featured for now)
          const relRes = await fetch('/api/products?featured=true');
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelatedProducts(relData.filter((p: Product) => p.id !== data.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Error fetching product', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) return toast.error('Please select a size');
    if (!selectedColor) return toast.error('Please select a color');

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: selectedImage
    });
    
    toast.success('Added to cart successfully!');
  };

  if (loading) {
    return (
      <div className="page-container py-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 flex gap-4">
            <div className="w-20 space-y-4 hidden md:block">
              {[1, 2, 3].map(i => <div key={i} className="w-full aspect-square bg-gray-200 rounded-lg"></div>)}
            </div>
            <div className="flex-1 aspect-[4/5] bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
  const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes || [];
  const colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors || [];

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100">
        <div className="page-container py-4 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link href="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-black font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="page-container py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 shrink-0">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === img ? 'border-brand-500' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`${product.name} - ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden relative aspect-[4/5] lg:aspect-auto lg:h-[700px] flex items-center justify-center">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Palette size={64} className="mb-4 opacity-20" />
                  <span>No image available</span>
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute top-4 left-4 badge bg-red-500 text-white text-sm">Out of Stock</div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-2 flex items-center gap-4">
              <span className="text-brand-500 font-bold tracking-wider text-sm uppercase">DELTRAS49</span>
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < 4 ? "currentColor" : "none"} />)}
                <span className="text-gray-500 text-sm ml-2">(128 reviews)</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold font-poppins text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {product.price < 30 && (
                <span className="badge bg-green-100 text-green-700 font-bold border border-green-200">SAVE 20%</span>
              )}
            </div>
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {product.description || "Premium quality cotton t-shirt designed for maximum comfort and style. Features a modern fit, double-needle stitching, and preshrunk fabric for lasting wear."}
            </p>

            <div className="border-t border-gray-200 pt-8 space-y-8">
              {/* Size Selector */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Select Size</h3>
                    <button className="text-sm text-gray-500 underline hover:text-black">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all ${
                          selectedSize === size 
                            ? 'border-black bg-black text-white' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Select Color: <span className="font-normal text-gray-600">{selectedColor}</span></h3>
                  <div className="flex flex-wrap gap-4">
                    {colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-transform ${
                          selectedColor === color ? 'border-brand-500 scale-110 shadow-md' : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      >
                        {selectedColor === color && (
                          <Check size={20} className={['white', '#fff', '#ffffff'].includes(color.toLowerCase()) ? 'text-black' : 'text-white'} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* Quantity */}
                <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl px-4 py-3 sm:w-1/3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 hover:text-black p-1">
                    <Minus size={20} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-gray-500 hover:text-black p-1">
                    <Plus size={20} />
                  </button>
                </div>
                
                {/* Add to Cart */}
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={22} />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Customize link */}
              <Link href={`/customize?base=${product.id}`} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50/50 transition-colors font-medium">
                <Palette size={20} /> Want to add your own design? Customize this shirt
              </Link>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3 text-gray-700">
                <Truck className="text-brand-500 shrink-0" size={24} />
                <span className="text-sm font-medium">Free shipping over $50</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <RotateCcw className="text-brand-500 shrink-0" size={24} />
                <span className="text-sm font-medium">30-day free returns</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Shield className="text-brand-500 shrink-0" size={24} />
                <span className="text-sm font-medium">2-year quality warranty</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-gray-50 py-16 mt-12 border-t border-gray-200">
          <div className="page-container">
            <h2 className="text-2xl font-bold font-poppins mb-8 text-center">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => {
                const relImages = typeof rel.images === 'string' ? JSON.parse(rel.images) : rel.images;
                const img = relImages && relImages.length > 0 ? relImages[0] : '';
                return (
                  <Link href={`/product/${rel.id}`} key={rel.id} className="card card-hover group bg-white">
                    <div className="aspect-[4/5] bg-gray-100 rounded-t-2xl overflow-hidden relative">
                      {img ? (
                        <img src={img} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Shirt className="text-gray-300" size={48} /></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate mb-1">{rel.name}</h3>
                      <p className="font-bold">{formatPrice(rel.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
