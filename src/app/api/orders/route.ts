import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { parseStringArray } from '@/lib/products';

const PAYMENT_METHODS = ['credit_card', 'paypal', 'cod', 'upi'];
const SHIPPING_FIELDS = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'] as const;

interface OrderItemInput {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  customDesign?: string;
}

interface ShippingInfoInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOrderItem(value: unknown): value is OrderItemInput {
  return isRecord(value) &&
    typeof value.productId === 'string' &&
    Number.isInteger(value.quantity) &&
    (value.quantity as number) > 0 &&
    typeof value.size === 'string' &&
    typeof value.color === 'string' &&
    (value.customDesign === undefined || typeof value.customDesign === 'string');
}

function isOrderItems(value: unknown): value is OrderItemInput[] {
  return Array.isArray(value) && value.every(isOrderItem);
}

function isShippingInfo(value: unknown): value is ShippingInfoInput {
  return isRecord(value) && SHIPPING_FIELDS.every((field) =>
    typeof value[field] === 'string' && value[field].trim().length > 0
  );
}

function roundCurrency(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const all = request.nextUrl.searchParams.get('all') === 'true' && decoded.role === 'ADMIN';

    const ordersRaw = await prisma.order.findMany({
      where: all ? {} : { userId: decoded.userId },
      include: {
        items: true,
        ...(all ? { user: { select: { id: true, name: true, email: true } } } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    const orders = ordersRaw.map((order) => ({
      ...order,
      customerName: order.user?.name || order.shippingName || '',
      customerEmail: order.user?.email || order.shippingEmail || '',
      totalAmount: order.total,
      items: order.items.map((item) => ({
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

    const body: unknown = await request.json();
    if (!isRecord(body) || !isOrderItems(body.items) || body.items.length === 0 ||
        body.items.length > 50 || !isShippingInfo(body.shippingInfo) ||
        typeof body.paymentMethod !== 'string' || !PAYMENT_METHODS.includes(body.paymentMethod)) {
      return NextResponse.json({ error: 'Invalid order details' }, { status: 400 });
    }
    const items = body.items;
    const shippingInfo = body.shippingInfo;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email.trim())) {
      return NextResponse.json({ error: 'Invalid shipping details' }, { status: 400 });
    }
    const paymentMethod = body.paymentMethod;

    const quantities = new Map<string, number>();
    for (const item of items) {
      if (!item || typeof item.productId !== 'string' || !item.productId ||
          !Number.isInteger(item.quantity) || item.quantity < 1 ||
          typeof item.size !== 'string' || typeof item.color !== 'string') {
        return NextResponse.json({ error: 'Invalid order item' }, { status: 400 });
      }
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }
    const productIds = Array.from(quantities.keys());

    const order = await prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: { id: { in: productIds }, published: true }
      });
      if (products.length !== quantities.size) {
        throw new Error('One or more products are unavailable');
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      const subtotal = roundCurrency(items.reduce((sum, item) => {
        const product = productsById.get(item.productId);
        if (!product) throw new Error('One or more products are unavailable');

        const sizes = parseStringArray(product.sizes);
        const colors = parseStringArray(product.colors);
        if (!sizes.includes(item.size) || !colors.includes(item.color)) {
          throw new Error(`${product.name} has an invalid size or color`);
        }
        return sum + product.price * item.quantity;
      }, 0));
      const tax = roundCurrency(subtotal * 0.08);
      const shipping = subtotal === 0 || subtotal > 50 ? 0 : 5.99;
      const total = roundCurrency(subtotal + tax + shipping);

      for (const [productId, quantity] of Array.from(quantities.entries())) {
        const result = await transaction.product.updateMany({
          where: { id: productId, published: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } }
        });
        if (result.count !== 1) {
          throw new Error(`${productsById.get(productId)?.name || 'A product'} does not have enough stock`);
        }
      }

      return transaction.order.create({
        data: {
          userId: decoded.userId,
          paymentMethod,
          subtotal,
          tax,
          shipping,
          total,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          shippingName: shippingInfo.name.trim(),
          shippingEmail: shippingInfo.email.trim(),
          shippingPhone: shippingInfo.phone.trim(),
          shippingAddress: shippingInfo.address.trim(),
          shippingCity: shippingInfo.city.trim(),
          shippingState: shippingInfo.state.trim(),
          shippingZip: shippingInfo.zip.trim(),
          shippingCountry: shippingInfo.country.trim(),
          items: {
            create: items.map((item) => {
              const product = productsById.get(item.productId)!;
              return {
                productId: product.id,
                name: product.name,
                image: parseStringArray(product.images)[0] || '',
                price: product.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                customDesign: typeof item.customDesign === 'string' ? item.customDesign : null
              };
            })
          }
        },
        include: { items: true }
      });
    });

    return NextResponse.json({ order, message: 'Order placed successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error && (
      error.message.includes('unavailable') ||
      error.message.includes('invalid size or color') ||
      error.message.includes('enough stock')
    )) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
