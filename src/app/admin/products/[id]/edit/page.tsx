'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, X, Save, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { TSHIRT_COLORS, TSHIRT_SIZES, CATEGORIES } from '@/lib/utils';
import { Product } from '@/types';

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Unisex',
    stock: '100',
    published: true,
    featured: false,
    sizes: [] as string[],
    colors: [] as string[]
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const product: Product = await res.json();
          
          let parsedImages = [];
          let parsedSizes = [];
          let parsedColors = [];
          
          try { parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images; } catch(e) {}
          try { parsedSizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes; } catch(e) {}
          try { parsedColors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors; } catch(e) {}

          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
            category: product.category,
            stock: product.stock.toString(),
            published: product.published,
            featured: product.featured,
            sizes: parsedSizes,
            colors: parsedColors
          });
          setImages(parsedImages);
        } else {
          toast.error('Product not found');
          router.push('/admin/products');
        }
      } catch (error) {
        toast.error('Error fetching product');
        router.push('/admin/products');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (colorName: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorName)
        ? prev.colors.filter(c => c !== colorName)
        : [...prev.colors, colorName]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setImages(prev => [...prev, data.url]);
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return toast.error('Please upload at least one image');
    if (formData.sizes.length === 0) return toast.error('Please select at least one size');
    if (formData.colors.length === 0) return toast.error('Please select at least one color');

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock, 10),
        images: JSON.stringify(images),
        sizes: JSON.stringify(formData.sizes),
        colors: JSON.stringify(formData.colors),
      };

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Product updated successfully');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      toast.error('Error updating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted successfully');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold font-poppins text-gray-900">Edit Product</h1>
        </div>
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="btn-danger flex items-center gap-2"
        >
          <Trash2 size={18} />
          <span className="hidden sm:inline">Delete Product</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold font-poppins border-b pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" required rows={5} value={formData.description} onChange={handleChange} className="input-field" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input type="number" name="price" step="0.01" required min="0" value={formData.price} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
                  <input type="number" name="originalPrice" step="0.01" min="0" value={formData.originalPrice} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </div>

            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-bold font-poppins border-b pb-2">Variants & Attributes</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sizes *</label>
                <div className="flex flex-wrap gap-2">
                  {TSHIRT_SIZES.map(size => (
                    <button
                      type="button" key={size} onClick={() => toggleSize(size)}
                      className={`px-4 py-2 border rounded-md font-medium transition-all ${
                        formData.sizes.includes(size) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors *</label>
                <div className="flex flex-wrap gap-3">
                  {TSHIRT_COLORS.map(color => (
                    <button
                      type="button" key={color.name} onClick={() => toggleColor(color.name)} title={color.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                        formData.colors.includes(color.name) ? 'border-brand-500 scale-110 shadow-md' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {formData.colors.includes(color.name) && (
                        <div className={`w-3 h-3 rounded-full ${color.hex === '#FFFFFF' ? 'bg-black' : 'bg-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold font-poppins border-b pb-2">Organization</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} className="input-field" />
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Published Status</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold font-poppins border-b pb-2">Images *</h2>
              
              <div className="grid grid-cols-2 gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden group">
                    <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? <div className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full mb-2"></div> : <Upload className="w-8 h-8 mb-2 text-gray-400" />}
                    <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Link href="/admin/products" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
            {isSubmitting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <Save size={20} />}
            <span>Update Product</span>
          </button>
        </div>
      </form>
    </div>
  );
}
