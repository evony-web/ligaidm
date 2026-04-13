import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const club = await db.club.findUnique({
    where: { id },
    include: {
      members: { include: { player: true } },
      season: true,
    },
  });
  if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  return NextResponse.json(club);
}
