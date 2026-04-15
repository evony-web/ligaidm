import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const player = await db.player.findUnique({
    where: { id },
    include: {
      teamPlayers: { include: { team: { include: { tournament: true } } } },
      participations: { include: { tournament: true } },
      clubMembers: { include: { club: true } },
    },
  });

  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }

  return NextResponse.json(player);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const body = await request.json();

  const player = await db.player.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.gamertag && { gamertag: body.gamertag }),
      ...(body.tier && { tier: body.tier }),
      ...(body.avatar && { avatar: body.avatar }),
      ...(body.points !== undefined && { points: body.points }),
      ...(body.totalWins !== undefined && { totalWins: body.totalWins }),
      ...(body.totalMvp !== undefined && { totalMvp: body.totalMvp }),
      ...(body.streak !== undefined && { streak: body.streak }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.registrationStatus && { registrationStatus: body.registrationStatus }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.joki !== undefined && { joki: body.joki }),
    },
  });

  return NextResponse.json(player);
}
