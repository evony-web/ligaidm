import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    const existing = await db.admin.findUnique({ where: { username: 'jose' } });
    if (existing) {
      return NextResponse.json({ message: 'Super admin already exists' });
    }
    const passwordHash = await hashPassword('tazevsta');
    await db.admin.create({
      data: {
        username: 'jose',
        passwordHash,
        role: 'super_admin',
        displayName: 'Super Admin',
      },
    });
    return NextResponse.json({ message: 'Super admin created' });
  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const existing = await db.admin.findUnique({ where: { username: 'jose' } });
    return NextResponse.json({ exists: !!existing });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ exists: false });
  }
}
