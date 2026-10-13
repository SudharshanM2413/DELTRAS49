import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { parseStringArray, serializeProduct } from '@/lib/products';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const allRequested = searchParams.get('all') === 'true';
    const token = allRequested ? cookies().get('auth-token')?.value : null;
    const decoded = token ? await verifyToken(token) : null;
    const showAll = allRequested && decoded?.role === 'ADMIN';

    const where: Prisma.ProductWhereInput = {};
    if (!showAll) where.published = true;

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

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'name') orderBy = { name: 'asc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const productsRaw = await prisma.product.findMany({
      where,
      orderBy
    });

    const products = productsRaw.map(serializeProduct);

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

    if (typeof name !== 'string' || !name.trim() ||
        typeof description !== 'string' || !description.trim() ||
        typeof category !== 'string' || !category.trim() ||
        typeof price !== 'number' || !Number.isFinite(price) || price < 0 ||
        (originalPrice !== undefined && originalPrice !== null &&
          (typeof originalPrice !== 'number' || !Number.isFinite(originalPrice) || originalPrice < 0)) ||
        !Number.isInteger(stock) || stock < 0 ||
        (published !== undefined && typeof published !== 'boolean') ||
        (featured !== undefined && typeof featured !== 'boolean')) {
      return NextResponse.json({ error: 'Invalid product details' }, { status: 400 });
    }

    const normalizedImages = parseStringArray(images);
    const normalizedSizes = parseStringArray(sizes);
    const normalizedColors = parseStringArray(colors);
    if (normalizedImages.length === 0 || normalizedSizes.length === 0 || normalizedColors.length === 0) {
      return NextResponse.json({ error: 'Products require at least one image, size, and color' }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        originalPrice,
        images: JSON.stringify(normalizedImages),
        sizes: JSON.stringify(normalizedSizes),
        colors: JSON.stringify(normalizedColors),
        category: category.trim(),
        stock,
        published: published ?? true,
        featured: featured ?? false
      }
    });

    return NextResponse.json({ product: serializeProduct(product) }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Error && error.message === 'Invalid product list data') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
