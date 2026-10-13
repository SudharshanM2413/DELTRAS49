import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get('all');

    let where: any = {};
    let includeOptions: any = {
      items: true
    };

    if (all === 'true' && decoded.role === 'ADMIN') {
      includeOptions.user = { select: { id: true, name: true, email: true } };
    } else {
      where.userId = decoded.userId;
    }

    const ordersRaw = await prisma.order.findMany({
      where,
      include: includeOptions,
      orderBy: { createdAt: 'desc' }
    });

    const orders = ordersRaw.map((order: any) => ({
      ...order,
      customerName: order.user?.name || order.shippingName || '',
      customerEmail: order.user?.email || order.shippingEmail || '',
      totalAmount: order.total,
      items: order.items.map((item: any) => ({
        ...item,
        productName: item.name,
        productImage: item.image || '',
        productImages: item.image ? [item.image] : []
      }))
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { items, shippingInfo, paymentMethod, subtotal, tax, shipping, total } = body;

    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingName: shippingInfo?.name || '',
        shippingEmail: shippingInfo?.email || '',
        shippingPhone: shippingInfo?.phone || '',
        shippingAddress: shippingInfo?.address || '',
        shippingCity: shippingInfo?.city || '',
        shippingState: shippingInfo?.state || '',
        shippingZip: shippingInfo?.zip || '',
        shippingCountry: shippingInfo?.country || '',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            image: item.image || '',
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }))
        }
      },
      include: { items: true }
    });

    return NextResponse.json({ order, message: 'Order placed successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
