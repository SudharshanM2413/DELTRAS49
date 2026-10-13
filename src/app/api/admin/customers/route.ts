import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Customer list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
