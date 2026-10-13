import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const all = searchParams.get('all');

    const where: any = {};

    if (all !== 'true') {
      where.published = true;
    }

    if (category) {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'name') orderBy = { name: 'asc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const productsRaw = await prisma.product.findMany({
      where,
      orderBy
    });

    const products = productsRaw.map((p: any) => ({
      ...p,
      images: JSON.parse(p.images as string),
      sizes: JSON.parse(p.sizes as string),
      colors: JSON.parse(p.colors as string)
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, originalPrice, images, sizes, colors, category, stock, published, featured } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        images: JSON.stringify(images || []),
        sizes: JSON.stringify(sizes || []),
        colors: JSON.stringify(colors || []),
        category,
        stock: stock || 0,
        published: published ?? true,
        featured: featured ?? false
      }
    });

    const parsedProduct = {
      ...product,
      images: JSON.parse(product.images as string),
      sizes: JSON.parse(product.sizes as string),
      colors: JSON.parse(product.colors as string)
    };

    return NextResponse.json({ product: parsedProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
