'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ProgressTracker from '@/components/ProgressTracker';
import Link from 'next/link';

export default function TrackAnimePage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnime = async () => {
            try {
                const res = await fetch('/api/animes');
                const animes = await res.json();
                const found = animes.find(a => a.id === id);

                if (found) {
                    setAnime(found);
                } else {
                    alert('Anime no encontrado');
                    router.push('/');
                }
            } catch (error) {
                console.error(error);
                alert('Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };

        fetchAnime();
    }, [id, router]);

    if (loading) return <div className="container py-10 text-center">Cargando...</div>;
    if (!anime) return null;

    return (
        <div className="container py-10" style={{ maxWidth: '800px' }}>
            <Link href={`/anime/${id}`} className="flex items-center text-secondary mb-6" style={{ gap: '0.5rem' }}>
                ← Volver a detalles
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-accent">Gestionar Progreso: {anime.title}</h1>

            <ProgressTracker anime={anime} />
        </div>
    );
}
