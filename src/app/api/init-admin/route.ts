import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Check if super admin already exists
    const existing = await db.admin.findFirst({ where: { role: 'super_admin' } });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Super admin already exists',
        admin: { id: existing.id, username: existing.username, role: existing.role },
      });
    }

    // Create super admin
    const passwordHash = await hashPassword('tazevsta');
    const admin = await db.admin.create({
      data: {
        username: 'jose',
        passwordHash,
        role: 'super_admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully',
      admin: { id: admin.id, username: admin.username, role: admin.role },
    });
  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize admin' },
      { status: 500 }
    );
  }
}
