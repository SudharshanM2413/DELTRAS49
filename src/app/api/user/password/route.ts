import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    const decoded = token ? await verifyToken(token) : null;
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string' ||
        body.newPassword.length < 6) {
      return NextResponse.json({ error: 'A current password and a new password of at least 6 characters are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { password: true }
    });
    if (!user || !(await verifyPassword(body.currentPassword, user.password))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: await hashPassword(body.newPassword) }
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
