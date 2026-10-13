import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      id: uuid(),
      name: 'Store Owner',
      email: 'admin@threadcraft.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+1 555 000 0001',
    },
  });
  console.log('✅ Admin user created: admin@threadcraft.com / admin123');

  // Create customer user
  const customerPassword = await hash('customer123', 12);
  const customer = await prisma.user.create({
    data: {
      id: uuid(),
      name: 'John Doe',
      email: 'john@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+1 555 000 0002',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'US',
    },
  });
  console.log('✅ Customer user created: john@example.com / customer123');

  // Create sample products
  const products = [
    {
      name: 'Classic Black Tee',
      description: 'A timeless black t-shirt crafted from 100% premium cotton. Perfect for any occasion. Features a relaxed fit with reinforced stitching for durability. This essential piece is the foundation of every great wardrobe.',
      price: 29.99,
      originalPrice: 39.99,
      images: JSON.stringify(['/uploads/product-black-tee.svg']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['#000000', '#1e3a5f', '#7f1d1d']),
      category: 'Unisex',
      stock: 150,
      published: true,
      featured: true,
    },
    {
      name: 'Ocean Wave Graphic Tee',
      description: 'Ride the wave with this stunning ocean-inspired graphic t-shirt. Made from soft organic cotton blend with a vibrant, fade-resistant print. Perfect for beach lovers and adventure seekers.',
      price: 34.99,
      originalPrice: 44.99,
      images: JSON.stringify(['/uploads/product-ocean-tee.svg']),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['#2563eb', '#FFFFFF', '#000000']),
      category: 'Unisex',
      stock: 85,
      published: true,
      featured: true,
    },
    {
      name: 'Vintage Rose Print',
      description: 'Elegant vintage rose print on premium quality fabric. This beautiful t-shirt combines classic floral design with modern comfort. Ideal for casual outings and weekend brunch.',
      price: 32.99,
      originalPrice: null,
      images: JSON.stringify(['/uploads/product-rose-tee.svg']),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
      colors: JSON.stringify(['#ec4899', '#FFFFFF', '#000000']),
      category: 'Women',
      stock: 60,
      published: true,
      featured: true,
    },
    {
      name: 'Urban Street Tee',
      description: 'Street-style inspired graphic tee with bold typography. Made from heavyweight cotton for that premium feel. Features an oversized fit that is trending this season.',
      price: 36.99,
      originalPrice: 49.99,
      images: JSON.stringify(['/uploads/product-urban-tee.svg']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL', '3XL']),
      colors: JSON.stringify(['#000000', '#6b7280', '#FFFFFF']),
      category: 'Men',
      stock: 120,
      published: true,
      featured: false,
    },
    {
      name: 'Sunset Gradient Tee',
      description: 'Beautiful sunset gradient design that transitions from warm orange to deep purple. A unique piece that stands out in any crowd. Made from moisture-wicking fabric perfect for summer.',
      price: 38.99,
      originalPrice: null,
      images: JSON.stringify(['/uploads/product-sunset-tee.svg']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['#ea580c', '#7c3aed', '#000000']),
      category: 'Unisex',
      stock: 45,
      published: true,
      featured: true,
    },
    {
      name: 'Kids Dino Fun Tee',
      description: 'Fun dinosaur print t-shirt for kids. Made from ultra-soft cotton that is gentle on sensitive skin. Features vibrant colors that stay bright wash after wash. Your little ones will love it!',
      price: 22.99,
      originalPrice: 28.99,
      images: JSON.stringify(['/uploads/product-dino-tee.svg']),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
      colors: JSON.stringify(['#166534', '#2563eb', '#eab308']),
      category: 'Kids',
      stock: 200,
      published: true,
      featured: false,
    },
    {
      name: 'Minimalist Logo Tee',
      description: 'Clean minimalist design with our signature logo. Less is more with this sophisticated t-shirt. Made from premium Pima cotton for exceptional softness and comfort.',
      price: 27.99,
      originalPrice: null,
      images: JSON.stringify(['/uploads/product-minimal-tee.svg']),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['#FFFFFF', '#000000', '#6b7280']),
      category: 'Unisex',
      stock: 175,
      published: true,
      featured: false,
    },
    {
      name: 'Retro Striped Tee',
      description: 'Retro-inspired striped t-shirt with a modern twist. Features horizontal stripes in complementary colors. Made from ring-spun cotton for a vintage feel with modern comfort.',
      price: 31.99,
      originalPrice: 42.99,
      images: JSON.stringify(['/uploads/product-retro-tee.svg']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['#dc2626', '#1e3a5f', '#166534']),
      category: 'Men',
      stock: 90,
      published: true,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        id: uuid(),
        ...product,
      },
    });
  }
  console.log(`✅ ${products.length} products created`);

  // Create a sample order
  const firstProduct = await prisma.product.findFirst();
  if (firstProduct) {
    const order = await prisma.order.create({
      data: {
        id: uuid(),
        userId: customer.id,
        status: 'DELIVERED',
        total: 35.06,
        subtotal: 29.99,
        tax: 2.40,
        shipping: 0,
        paymentMethod: 'credit_card',
        paymentStatus: 'PAID',
        paymentId: 'demo_pay_001',
        shippingName: 'John Doe',
        shippingEmail: 'john@example.com',
        shippingPhone: '+1 555 000 0002',
        shippingAddress: '456 Oak Avenue',
        shippingCity: 'Los Angeles',
        shippingState: 'CA',
        shippingZip: '90001',
        shippingCountry: 'US',
        items: {
          create: {
            id: uuid(),
            productId: firstProduct.id,
            name: firstProduct.name,
            image: JSON.parse(firstProduct.images)[0] || '',
            quantity: 1,
            size: 'M',
            color: '#000000',
            price: 29.99,
          },
        },
      },
    });
    console.log('✅ Sample order created');
  }

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:    admin@threadcraft.com / admin123');
  console.log('   Customer: john@example.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
