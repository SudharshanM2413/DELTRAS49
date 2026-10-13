import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [paidOrders, totalOrdersCount, totalCustomers, totalProducts, recentOrdersRaw] = await Promise.all([
      prisma.order.findMany({ where: { paymentStatus: 'PAID' }, select: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true
        }
      })
    ]);

    const totalRevenue = paidOrders.reduce((sum: number, order: any) => sum + order.total, 0);

    const allOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      },
      select: { createdAt: true, total: true }
    });

    const monthlyData: Record<string, number> = {};
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthYear] = 0;
    }

    allOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[monthYear] !== undefined) {
        monthlyData[monthYear] += order.total;
      }
    });

    const monthlyRevenue = Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }));

    const recentOrders = recentOrdersRaw.map((order) => ({
      ...order,
      customerName: order.user.name,
      customerEmail: order.user.email,
      totalAmount: order.total
    }));

    const stats = {
      totalRevenue,
      totalOrders: totalOrdersCount,
      totalCustomers,
      totalProducts,
      recentOrders,
      monthlyRevenue
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
