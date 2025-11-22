'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProgressTracker({ anime }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(0);

    // Calculate current state from total watched
    useEffect(() => {
        if (!anime.season_distribution || anime.season_distribution.length === 0) return;

        let remaining = anime.watched_episodes || 0;
        let currentSeason = 1;

        for (let i = 0; i < anime.season_distribution.length; i++) {
            const seasonCaps = anime.season_distribution[i];
            if (remaining > seasonCaps) {
                remaining -= seasonCaps;
                currentSeason++;
            } else {
                break;
            }
        }

        // Cap at max season
        if (currentSeason > anime.season_distribution.length) {
            currentSeason = anime.season_distribution.length;
            remaining = anime.season_distribution[currentSeason - 1];
        }

        setSelectedSeason(currentSeason);
        setSelectedEpisode(remaining);
    }, [anime]);

    const handleUpdate = async (newSeason, newEpisode) => {
        setLoading(true);

        // Calculate total watched based on new selection
        let totalWatched = 0;
        for (let i = 0; i < newSeason - 1; i++) {
            totalWatched += anime.season_distribution[i];
        }
        totalWatched += parseInt(newEpisode);

        try {
            const res = await fetch(`/api/animes/${anime.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...anime,
                    watched_episodes: totalWatched
                })
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!anime.season_distribution || anime.season_distribution.length === 0) return null;

    const currentSeasonEpisodes = anime.season_distribution[selectedSeason - 1] || 0;

    // Calculate total watched based on LOCAL state for immediate feedback
    let currentTotalWatched = 0;
    for (let i = 0; i < selectedSeason - 1; i++) {
        currentTotalWatched += anime.season_distribution[i];
    }
    currentTotalWatched += parseInt(selectedEpisode);

    const progressPercentage = ((currentTotalWatched || 0) / anime.episodes) * 100;

    // Format with leading zeros if needed (e.g. 05/24)
    const formattedWatched = String(currentTotalWatched).padStart(2, '0');

    return (
        <div className="p-8 mt-6 relative overflow-hidden" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '1rem',
            border: '1px solid var(--card-border)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
        }}>
            {/* Background Glow Effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                opacity: 0.1,
                pointerEvents: 'none'
            }} />

            <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Tu Progreso</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-accent" style={{ textShadow: '0 0 20px var(--accent-glow)' }}>
                            {formattedWatched}
                        </span>
                        <span className="text-secondary text-sm ml-2">/ {anime.episodes}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[var(--bg-primary)] rounded-full h-4 mb-8 p-1 border border-[var(--card-border)]">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out relative"
                        style={{
                            width: `${Math.min(progressPercentage, 100)}%`,
                            background: 'linear-gradient(90deg, var(--accent), #a78bfa)',
                            boxShadow: '0 0 15px var(--accent-glow)'
                        }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50 rounded-full" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="form-label text-xs uppercase tracking-wider text-secondary mb-2 block group-hover:text-accent transition-colors">Temporada</label>
                        <div className="relative">
                            <select
                                className="form-select w-full appearance-none cursor-pointer hover:border-accent transition-colors"
                                style={{ paddingRight: '2.5rem' }}
                                value={selectedSeason}
                                onChange={(e) => {
                                    const newSeason = parseInt(e.target.value);
                                    setSelectedSeason(newSeason);
                                    setSelectedEpisode(0);
                                    handleUpdate(newSeason, 0);
                                }}
                                disabled={loading}
                            >
                                {anime.season_distribution.map((_, index) => (
                                    <option key={index} value={index + 1}>
                                        Temporada {index + 1}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute text-secondary" style={{
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none'
                            }}>
                                ▼
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className="form-label text-xs uppercase tracking-wider text-secondary mb-2 block group-hover:text-accent transition-colors">
                            Episodio: <span className="text-white font-bold ml-1">{selectedEpisode}</span>
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={selectedEpisode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    const newEp = val === '' ? 0 : parseInt(val);
                                    if (newEp <= currentSeasonEpisodes) {
                                        setSelectedEpisode(newEp);
                                        handleUpdate(selectedSeason, newEp);
                                    }
                                }}
                                disabled={loading}
                                className="form-input text-center"
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--card-border)',
                                    padding: '0.5rem'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
