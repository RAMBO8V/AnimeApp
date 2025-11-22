import { getAnimes, saveAnime } from '@/lib/animes';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const animes = await getAnimes(session.user.id);
  return Response.json(animes);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newAnime = await saveAnime(session.user.id, body);
    return Response.json(newAnime, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
