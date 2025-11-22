'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.username.length < 3) {
            setError('El usuario debe tener al menos 3 caracteres');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al registrar usuario');
                return;
            }

            // Redirect to home instead of login
            alert('Cuenta creada exitosamente. Por favor inicia sesión.');
            router.push('/');
        } catch (err) {
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-16">
            <div className="form-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h1 className="text-3xl font-bold mb-8 text-center text-accent">Crear Cuenta</h1>

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
                            minLength={3}
                        />
                        <p className="text-xs text-secondary mt-1">Mínimo 3 caracteres</p>
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
                            minLength={6}
                        />
                        <p className="text-xs text-secondary mt-1">Mínimo 6 caracteres</p>
                        <p className="text-xs mt-1" style={{ color: '#a78bfa' }}>
                            💡 Sugerencia: Usa letras, números y símbolos para mayor seguridad
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmar Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>

                    <p className="text-center text-secondary text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-accent hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
