import { getAnimeById } from '@/lib/animes';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AnimeActions from '@/components/AnimeActions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export default async function AnimeDetails({ params }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const { id } = await params;
    const anime = await getAnimeById(session.user.id, id);

    if (!anime) {
        notFound();
    }

    return (
        <div className="container py-10">
            <Link href="/" className="flex items-center text-secondary mb-6" style={{ gap: '0.5rem' }}>
                ← Volver al catálogo
            </Link>

            <div className="details-grid">
                {/* Cover Image */}
                <div className="details-cover">
                    <Image
                        src={anime.cover}
                        alt={anime.title}
                        fill
                        className="card-image"
                        priority
                    />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
                        <div className="flex items-center gap-4">
                            <span className="tag tag-accent">
                                {anime.rating} ★
                            </span>
                            <span className="tag tag-secondary">
                                {anime.seasons || 1} Temporadas
                            </span>
                            <span className="tag tag-secondary">
                                {anime.episodes} Capítulos
                            </span>
                            <span className={`tag ${anime.status === 'En Emisión'
                                ? 'tag-green'
                                : 'tag-blue'
                                }`}>
                                {anime.status}
                            </span>
                            <span className="tag" style={{
                                backgroundColor: 'var(--accent)',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {String(anime.watched_episodes || 0).padStart(2, '0')} / {anime.episodes}
                            </span>
                        </div>
                    </div>

                    <div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                        <h2 className="text-xl font-bold mb-3 text-accent">Sinopsis</h2>
                        <p className="text-secondary text-lg" style={{ lineHeight: '1.6' }}>
                            {anime.description}
                        </p>
                    </div>

                    {anime.season_distribution && anime.season_distribution.length > 0 && (
                        <div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
                            <h2 className="text-xl font-bold mb-3 text-accent">Temporadas</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {anime.season_distribution.map((episodes, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 rounded bg-[var(--bg-primary)]">
                                        <span className="font-medium">Temporada {index + 1}</span>
                                        <span className="text-secondary">{episodes} Capítulos</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    <AnimeActions id={anime.id} />
                </div>
            </div>
        </div>
    );
}
