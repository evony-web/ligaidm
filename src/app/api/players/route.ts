import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get('division');
  const tier = searchParams.get('tier');

  const where: Record<string, string> = {};
  if (division) where.division = division;
  if (tier) where.tier = tier;

  const players = await db.player.findMany({
    where,
    orderBy: { points: 'desc' },
  });

  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, gamertag, division, tier, avatar } = body;

  if (!name || !gamertag || !division) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const player = await db.player.create({
      data: {
        name,
        gamertag,
        division,
        tier: tier || 'B',
        avatar: avatar || null,
      },
    });
    return NextResponse.json(player, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    if (error.message?.includes('Unique')) {
      return NextResponse.json({ error: 'Gamertag already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}
