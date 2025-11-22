'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function AnimeActions({ id }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este anime?')) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/animes/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                alert('Error al eliminar');
            }
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex gap-4 mt-6">
            <Link
                href={`/anime/${id}/edit`}
                className="btn btn-primary"
                style={{ flex: 1, textAlign: 'center' }}
            >
                Editar
            </Link>
            <Link
                href={`/anime/${id}/track`}
                className="btn"
                style={{ flex: 1, textAlign: 'center', backgroundColor: 'var(--accent)', color: 'white' }}
            >
                Progreso
            </Link>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn"
                style={{
                    flex: 1,
                    backgroundColor: '#ef4444',
                    color: 'white',
                    opacity: deleting ? 0.7 : 1
                }}
            >
                {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
        </div>
    );
}
