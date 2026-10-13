// ============================================
// T-Shirt E-Commerce — Shared TypeScript Types
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  avatar?: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string;
  stock: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
}

export interface CartItemType {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  customDesign?: string;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  totalAmount?: number;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingCost?: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string | null;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  notes?: string | null;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productName?: string;
  productImage?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  customDesign?: string | null;
  product?: Product;
  productName?: string;
  productImage?: string;
  productImages?: string[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'credit_card' | 'paypal' | 'cod' | 'upi';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: Order[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
