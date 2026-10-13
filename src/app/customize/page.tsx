'use client';

import { useState, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Palette, Type, Upload, Trash2, RefreshCcw, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SHIRT_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
];

const FONTS = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
];

const SIZES = ['S', 'M', 'L', 'XL', '2XL'];
const BASE_PRICE = 39.99;

export default function CustomizePage() {
  const { addItem } = useCartStore();
  
  // States
  const [shirtColor, setShirtColor] = useState(SHIRT_COLORS[0]);
  const [shirtSize, setShirtSize] = useState('M');
  
  const [texts, setTexts] = useState<Array<{ id: number; text: string; color: string; font: string; size: string }>>([]);
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textFont, setTextFont] = useState(FONTS[0].value);
  const [textSize, setTextSize] = useState('24px');
  
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = () => {
    if (!newText.trim()) return;
    setTexts([...texts, {
      id: Date.now(),
      text: newText,
      color: textColor,
      font: textFont,
      size: textSize
    }]);
    setNewText('');
  };

  const handleRemoveText = (id: number) => {
    setTexts(texts.filter(t => t.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearDesign = () => {
    setTexts([]);
    setImage(null);
    setImageName('');
    toast.success('Design cleared');
  };

  const handleAddToCart = () => {
    // Generate a unique ID for the custom product
    const customId = `custom-${Date.now()}`;
    
    addItem({
      productId: customId,
      name: 'Custom Designed T-Shirt',
      image: 'https://placehold.co/400x500/f3f4f6/1a1a1a?text=Custom+Design',
      price: BASE_PRICE,
      quantity: 1,
      size: shirtSize,
      color: shirtColor.hex,
      customDesign: newText || imageName || 'Custom design'
    });
    
    toast.success('Custom t-shirt added to cart!');
  };

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-8 text-center">Design Your T-Shirt</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Tools */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold flex items-center gap-2 mb-4 border-b pb-2">
              <Palette className="w-4 h-4 text-brand-500" /> T-Shirt Color
            </h3>
            <div className="flex flex-wrap gap-2">
              {SHIRT_COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setShirtColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-transform ${shirtColor.hex === color.hex ? 'border-brand-500 scale-110' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold flex items-center gap-2 mb-4 border-b pb-2">
              <Type className="w-4 h-4 text-brand-500" /> Add Text
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter text..."
                className="input-field w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                <select value={textFont} onChange={(e) => setTextFont(e.target.value)} className="input-field text-sm p-2">
                  {FONTS.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                </select>
                <select value={textSize} onChange={(e) => setTextSize(e.target.value)} className="input-field text-sm p-2">
                  <option value="16px">Small</option>
                  <option value="24px">Medium</option>
                  <option value="36px">Large</option>
                  <option value="48px">X-Large</option>
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 p-1 rounded cursor-pointer" />
                <button onClick={handleAddText} disabled={!newText.trim()} className="btn-secondary flex-1">
                  Add
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold flex items-center gap-2 mb-4 border-b pb-2">
              <Upload className="w-4 h-4 text-brand-500" /> Upload Design
            </h3>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-500 hover:bg-red-50 transition-colors flex flex-col items-center gap-2"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
            </button>
            {image && (
              <button onClick={() => {setImage(null); setImageName('');}} className="mt-2 text-red-500 text-sm hover:underline w-full text-center">
                Remove Image
              </button>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold flex items-center gap-2 mb-4 border-b pb-2">
              Choose Size
            </h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setShirtSize(size)}
                  className={`w-12 h-10 rounded-lg border font-medium transition-colors ${shirtSize === size ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
        </div>
        
        {/* Center: Canvas/Preview */}
        <div className="lg:col-span-6 bg-gray-100 rounded-3xl p-8 flex items-center justify-center min-h-[500px] relative overflow-hidden">
          <button 
            onClick={handleClearDesign}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-50 text-gray-600 transition-colors z-10"
            title="Reset Design"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          
          <div className="relative w-full max-w-md aspect-[3/4] animate-fade-in transition-colors duration-500"
               style={{ 
                 backgroundColor: shirtColor.hex,
                 maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 500\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M100 0 C130 30, 270 30, 300 0 L390 40 C395 42, 400 48, 400 55 L380 150 C378 155, 372 158, 366 156 L330 140 L330 480 C330 491, 321 500, 310 500 L90 500 C79 500, 70 491, 70 480 L70 140 L34 156 C28 158, 22 155, 20 150 L0 55 C0 48, 5 42, 10 40 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                 WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 500\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M100 0 C130 30, 270 30, 300 0 L390 40 C395 42, 400 48, 400 55 L380 150 C378 155, 372 158, 366 156 L330 140 L330 480 C330 491, 321 500, 310 500 L90 500 C79 500, 70 491, 70 480 L70 140 L34 156 C28 158, 22 155, 20 150 L0 55 C0 48, 5 42, 10 40 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                 maskSize: 'contain',
                 maskRepeat: 'no-repeat',
                 maskPosition: 'center',
                 WebkitMaskSize: 'contain',
                 WebkitMaskRepeat: 'no-repeat',
                 WebkitMaskPosition: 'center',
               }}>
            
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-10 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/fabric-plaid.png')]"></div>
            
            {/* Print Area Bounds (Invisible but contains design) */}
            <div className="absolute inset-0 flex flex-col items-center pt-24 pb-32 px-16 overflow-hidden">
              <div className="w-full h-full border border-dashed border-gray-400/30 rounded flex flex-col items-center justify-center relative p-2">
                
                {image && (
                  <img src={image} alt="Custom design" className="max-w-full max-h-[50%] object-contain mb-4 z-10" />
                )}
                
                <div className="flex flex-col items-center space-y-2 z-10 w-full">
                  {texts.map((t) => (
                    <div key={t.id} className="group relative w-full text-center">
                      <p 
                        style={{ color: t.color, fontFamily: t.font, fontSize: t.size }}
                        className="break-words max-w-full leading-tight font-bold drop-shadow-sm"
                      >
                        {t.text}
                      </p>
                      <button 
                        onClick={() => handleRemoveText(t.id)}
                        className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 bg-white/80 rounded-full p-1 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>
            
          </div>
        </div>
        
        {/* Right Panel: Summary */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold mb-4 font-[Poppins] border-b pb-4">Design Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Base Color:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{shirtColor.name}</span>
                  <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: shirtColor.hex }} />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Size:</span>
                <span className="font-medium text-lg">{shirtSize}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <span className="text-gray-500 block mb-2">Custom Elements:</span>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {imageName && <li>Image: {imageName}</li>}
                  {texts.map(t => <li key={t.id}>Text: "{t.text}"</li>)}
                  {!image && texts.length === 0 && <li className="text-gray-400 italic list-none -ml-5">No custom elements added</li>}
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 mb-6">
              <div className="flex justify-between items-end">
                <span className="font-bold text-gray-900">Total Price</span>
                <span className="font-bold text-3xl">{formatPrice(BASE_PRICE)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="btn-primary w-full py-4 text-lg font-bold flex justify-center items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">Free shipping on orders over $50!</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
