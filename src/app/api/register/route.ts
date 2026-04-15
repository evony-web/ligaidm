import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, joki, phone, city, clubId, division } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama/Nick wajib diisi' }, { status: 400 });
    }
    if (!city || !city.trim()) {
      return NextResponse.json({ error: 'Kota wajib diisi' }, { status: 400 });
    }
    if (!division || !['male', 'female'].includes(division)) {
      return NextResponse.json({ error: 'Division wajib dipilih (male/female)' }, { status: 400 });
    }

    // Generate unique gamertag from name
    const baseTag = name.trim().replace(/\s+/g, '');
    let gamertag = baseTag;
    let counter = 1;

    // Check for existing gamertag and make unique if needed
    while (true) {
      const existing = await db.player.findUnique({ where: { gamertag } });
      if (!existing) break;
      counter++;
      gamertag = `${baseTag}${counter}`;
    }

    // Validate club if provided
    if (clubId) {
      const club = await db.club.findUnique({ where: { id: clubId } });
      if (!club) {
        return NextResponse.json({ error: 'Club tidak ditemukan' }, { status: 400 });
      }
    }

    // Create player with pending registration status
    const player = await db.player.create({
      data: {
        name: name.trim(),
        gamertag,
        division,
        tier: 'B', // Default tier for new registrations
        city: city.trim(),
        joki: joki?.trim() || null,
        phone: phone?.trim() || null,
        registrationStatus: 'pending',
        isActive: true,
      },
    });

    // If club is selected, add as club member
    if (clubId) {
      await db.clubMember.create({
        data: {
          clubId,
          playerId: player.id,
          role: 'member',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil! Menunggu persetujuan admin.',
      player: {
        id: player.id,
        name: player.name,
        gamertag: player.gamertag,
        division: player.division,
        city: player.city,
        registrationStatus: player.registrationStatus,
      },
    }, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Gagal mendaftar. Silakan coba lagi.' }, { status: 500 });
  }
}
