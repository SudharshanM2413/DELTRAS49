import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orderRaw = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!orderRaw) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (orderRaw.userId !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const order = {
      ...orderRaw,
      customerName: orderRaw.user?.name || orderRaw.shippingName || '',
      customerEmail: orderRaw.user?.email || orderRaw.shippingEmail || '',
      customerPhone: orderRaw.shippingPhone || '',
      totalAmount: orderRaw.total,
      shippingCost: orderRaw.shipping,
      items: orderRaw.items.map((item: any) => ({
        ...item,
        productName: item.name,
        productImage: item.image || '',
        productImages: item.image ? [item.image] : []
      }))
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { status, paymentStatus } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: dataToUpdate
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
