import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { serializeProduct, serializeStringArray } from '@/lib/products';
import { Prisma } from '@prisma/client';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth-token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    const productRaw = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!productRaw || (!productRaw.published && decoded?.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(serializeProduct(productRaw));
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid product details' }, { status: 400 });
    }
    const updateData: Prisma.ProductUpdateInput = {};
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }
    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || !body.description.trim()) {
        return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
      }
      updateData.description = body.description.trim();
    }
    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
        return NextResponse.json({ error: 'Invalid product price' }, { status: 400 });
      }
      updateData.price = body.price;
    }
    if (body.originalPrice !== undefined) {
      if (body.originalPrice !== null &&
          (typeof body.originalPrice !== 'number' || !Number.isFinite(body.originalPrice) || body.originalPrice < 0)) {
        return NextResponse.json({ error: 'Invalid original price' }, { status: 400 });
      }
      updateData.originalPrice = body.originalPrice;
    }
    if (body.category !== undefined) {
      if (typeof body.category !== 'string' || !body.category.trim()) {
        return NextResponse.json({ error: 'Product category is required' }, { status: 400 });
      }
      updateData.category = body.category.trim();
    }
    if (body.stock !== undefined) {
      if (!Number.isInteger(body.stock) || (body.stock as number) < 0) {
        return NextResponse.json({ error: 'Invalid stock quantity' }, { status: 400 });
      }
      updateData.stock = body.stock as number;
    }
    if (body.published !== undefined) {
      if (typeof body.published !== 'boolean') {
        return NextResponse.json({ error: 'Invalid publish status' }, { status: 400 });
      }
      updateData.published = body.published;
    }
    if (body.featured !== undefined) {
      if (typeof body.featured !== 'boolean') {
        return NextResponse.json({ error: 'Invalid featured status' }, { status: 400 });
      }
      updateData.featured = body.featured;
    }
    if (body.images !== undefined) updateData.images = serializeStringArray(body.images);
    if (body.sizes !== undefined) updateData.sizes = serializeStringArray(body.sizes);
    if (body.colors !== undefined) updateData.colors = serializeStringArray(body.colors);

    const productRaw = await prisma.product.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(serializeProduct(productRaw));
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Error && error.message === 'Invalid product list data') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orderItemCount = await prisma.orderItem.count({ where: { productId: params.id } });
    if (orderItemCount > 0) {
      await prisma.product.update({
        where: { id: params.id },
        data: { published: false }
      });
      return NextResponse.json({ message: 'Product unpublished because it has order history' });
    }

    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
