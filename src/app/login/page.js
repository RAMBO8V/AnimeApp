'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                username: formData.username,
                password: formData.password,
                redirect: false
            });

            if (result?.error) {
                setError('Usuario o contraseña incorrectos');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-16">
            <div className="form-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h1 className="text-3xl font-bold mb-8 text-center text-accent">Iniciar Sesión</h1>

                {error && (
                    <div className="mb-6 p-4 rounded" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgb(239, 68, 68)'
                    }}>
                        <p className="text-sm" style={{ color: 'rgb(248, 113, 113)' }}>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Usuario</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <p className="text-center text-secondary text-sm">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-accent hover:underline">
                            Regístrate aquí
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
