'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditAnimePage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        episodes: 0,
        seasons: 1,
        season_distribution: [0],
        rating: '',
        status: 'En Emisión',
        cover: '',
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchAnime = async () => {
            try {
                const res = await fetch('/api/animes');
                const animes = await res.json();
                const anime = animes.find(a => a.id === id);

                if (anime) {
                    // Handle legacy data or existing distribution
                    let distribution = anime.season_distribution;
                    if (!distribution || distribution.length === 0) {
                        // If no distribution exists, assume 1 season with all episodes
                        distribution = [anime.episodes || 0];
                    }

                    setFormData({
                        title: anime.title,
                        episodes: anime.episodes,
                        seasons: anime.seasons || 1,
                        season_distribution: distribution,
                        rating: anime.rating,
                        status: anime.status,
                        cover: anime.cover,
                        description: anime.description
                    });
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'seasons') {
            // Allow empty string to let user clear the input
            if (value === '') {
                setFormData(prev => ({ ...prev, seasons: '' }));
                return;
            }

            const newSeasons = parseInt(value);
            // If invalid number (but not empty), don't update or default to 1
            if (isNaN(newSeasons)) return;

            // Ensure at least 1 season if user types 0 or negative (optional, but good UX)
            // But let's allow 0 temporarily if they are typing, though min="1" in input handles most.
            // Actually, let's just take the value.

            const currentDistribution = [...formData.season_distribution];

            // Adjust distribution array size
            while (currentDistribution.length < newSeasons) {
                currentDistribution.push(0);
            }
            while (currentDistribution.length > newSeasons) {
                currentDistribution.pop();
            }

            // Recalculate total episodes
            const totalEpisodes = currentDistribution.reduce((a, b) => a + b, 0);

            setFormData(prev => ({
                ...prev,
                seasons: newSeasons,
                season_distribution: currentDistribution,
                episodes: totalEpisodes
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSeasonChange = (index, value) => {
        const newDistribution = [...formData.season_distribution];
        // Allow empty string, otherwise parse as integer
        newDistribution[index] = value === '' ? '' : parseInt(value) || 0;

        const totalEpisodes = newDistribution.reduce((a, b) => (a || 0) + (b || 0), 0);

        setFormData(prev => ({
            ...prev,
            season_distribution: newDistribution,
            episodes: totalEpisodes
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/animes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    episodes: Number(formData.episodes),
                    seasons: Number(formData.seasons),
                    rating: Number(formData.rating)
                })
            });

            if (res.ok) {
                router.push(`/anime/${id}`);
                router.refresh();
            } else {
                alert('Error al actualizar');
            }
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container py-10 text-center">Cargando...</div>;

    return (
        <div className="container py-10" style={{ maxWidth: '800px' }}>
            <h1 className="text-3xl font-bold mb-8 text-accent">Editar Anime</h1>

            <form onSubmit={handleSubmit} className="form-container flex flex-col gap-6">
                <div className="form-group">
                    <label className="form-label">Título del Anime</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="form-input"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid-2">
                    <div>
                        <label className="form-label">Temporadas</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="seasons"
                            required
                            className="form-input"
                            value={formData.seasons}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="form-label">Capítulos Totales</label>
                        <input
                            type="number"
                            name="episodes"
                            readOnly
                            className="form-input"
                            style={{ backgroundColor: 'var(--bg-secondary)', opacity: 0.7 }}
                            value={formData.episodes}
                        />
                    </div>
                </div>

                {/* Dynamic Season Inputs */}
                <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg-secondary)]">
                    <h3 className="text-lg font-semibold mb-4 text-accent">Desglose por Temporada</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {formData.season_distribution.map((episodes, index) => (
                            <div key={index}>
                                <label className="form-label text-sm">Temporada {index + 1}</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="form-input"
                                    value={episodes}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        handleSeasonChange(index, value);
                                    }}
                                    placeholder={`Caps. Temp ${index + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid-2">
                    <div>
                        <label className="form-label">Calificación (0-5)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            name="rating"
                            required
                            className="form-input"
                            value={formData.rating}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="form-label">Estado</label>
                        <select
                            name="status"
                            className="form-select"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="En Emisión">En Emisión</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Próximamente">Próximamente</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">URL de Portada</label>
                    <input
                        type="url"
                        name="cover"
                        required
                        placeholder="https://..."
                        className="form-input"
                        value={formData.cover}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Sinopsis</label>
                    <textarea
                        name="description"
                        required
                        rows="4"
                        className="form-textarea"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn"
                        style={{ backgroundColor: 'var(--bg-secondary)', flex: 1 }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ flex: 2 }}
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
