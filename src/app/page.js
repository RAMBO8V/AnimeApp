'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      setLoading(false);
      return;
    }

    async function fetchAnimes() {
      try {
        const res = await fetch('/api/animes');
        if (res.ok) {
          const data = await res.json();
          setAnimes(data);
        }
      } catch (error) {
        console.error('Failed to fetch animes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnimes();
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="container py-16 text-center">
        <p className="text-secondary">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-16">
        <section className="hero mb-12 text-center py-16">
          <div className="hero-content">
            <h1 className="text-4xl font-extrabold mb-4">
              Bienvenido a <span className="text-accent">Anime Catalog</span>
            </h1>
            <p className="text-secondary text-lg mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
              Tu colección personal de anime. Rastrea tu progreso, guarda tus favoritos y mantén todo organizado.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login" className="btn btn-primary">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--accent)' }}>
                Registrarse
              </Link>
            </div>
          </div>
          <div className="absolute inset-0" style={{
            backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
            opacity: 0.2,
            mixBlendMode: 'overlay'
          }}></div>
        </section>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="hero mb-12 text-center py-16">
        <div className="hero-content">
          <h1 className="text-4xl font-extrabold mb-4">
            Explora tu <span className="text-accent">Mundo Anime</span>
          </h1>
          <p className="text-secondary text-lg mb-8" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
            Descubre, califica y organiza tus series favoritas en una colección diseñada para verdaderos fans.
          </p>
          <a href="#catalog" className="btn btn-primary">
            Ver Catálogo
          </a>
        </div>
        <div className="absolute inset-0" style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          opacity: 0.2,
          mixBlendMode: 'overlay'
        }}></div>
      </section>

      {/* Catalog Grid */}
      <section id="catalog">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold" style={{ borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>
            Tu Catálogo
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-secondary">Cargando animes...</div>
        ) : animes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-secondary mb-4">Aún no has agregado ningún anime</p>
            <Link href="/admin" className="btn btn-primary">
              Agregar tu primer anime
            </Link>
          </div>
        ) : (
          <div className="grid-auto-fit">
            {animes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
