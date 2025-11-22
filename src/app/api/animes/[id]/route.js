import { updateAnime, deleteAnime } from '@/lib/animes';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const updatedAnime = await updateAnime(session.user.id, id, data);

    if (!updatedAnime) {
        return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAnime);
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteAnime(session.user.id, id);

    if (!success) {
        return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
