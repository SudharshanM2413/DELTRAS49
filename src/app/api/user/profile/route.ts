import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const fields = ['name', 'phone', 'address', 'city', 'state', 'zipCode', 'country'] as const;
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (fields.some((field) => body[field] !== undefined && typeof body[field] !== 'string')) {
      return NextResponse.json({ error: 'Invalid profile details' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        zip: body.zipCode?.trim() || null,
        country: body.country?.trim() || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        country: true,
        avatar: true,
        createdAt: true
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
