import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center mb-4" aria-label="DELTRAS home">
              <div className="rounded-xl bg-white/5 p-1.5 ring-1 ring-white/10">
                <Image
                  src="/DELTA1.png"
                  alt="DELTRAS logo"
                  width={200}
                  height={80}
                  className="h-12 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium custom t-shirts made with love. Design your own or choose from our curated collection.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-gray-400 text-sm hover:text-white transition-colors">Shop All</Link></li>
              <li><Link href="/customize" className="text-gray-400 text-sm hover:text-white transition-colors">Customize T-Shirt</Link></li>
              <li><Link href="/shop?category=Men" className="text-gray-400 text-sm hover:text-white transition-colors">Men&apos;s Collection</Link></li>
              <li><Link href="/shop?category=Women" className="text-gray-400 text-sm hover:text-white transition-colors">Women&apos;s Collection</Link></li>
              <li><Link href="/shop?category=Kids" className="text-gray-400 text-sm hover:text-white transition-colors">Kids Collection</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Help</h3>
            <ul className="space-y-3">
              <li><Link href="/account" className="text-gray-400 text-sm hover:text-white transition-colors">My Account</Link></li>
              <li><Link href="/account/orders" className="text-gray-400 text-sm hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/cart" className="text-gray-400 text-sm hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">Size Guide</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                support@deltras49.com
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                123 Fashion Street, Design District, NY 10001
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} DELTRAS49. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
