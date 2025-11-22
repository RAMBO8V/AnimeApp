import Image from 'next/image';
import Link from 'next/link';

export default function AnimeCard({ anime }) {
    return (
        <Link href={`/anime/${anime.id}`} className="card group">
            <div className="card-image-wrapper">
                <Image
                    src={anime.cover}
                    alt={anime.title}
                    fill
                    className="card-image"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="card-overlay" />

                <div className="card-badge">
                    {anime.episodes} Eps
                </div>
            </div>

            <div className="card-content">
                <h3 className="card-title">
                    {anime.title}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex text-yellow-400">
                        {'★'.repeat(Math.round(anime.rating))}
                        <span className="text-secondary">{'★'.repeat(5 - Math.round(anime.rating))}</span>
                    </div>
                    <span className="text-secondary font-medium">{anime.rating}</span>
                </div>
            </div>
        </Link>
    );
}
