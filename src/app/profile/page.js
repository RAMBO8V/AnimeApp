'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('username');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [usernameForm, setUsernameForm] = useState({
        username: session?.user?.username || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    if (!session) {
        router.push('/login');
        return null;
    }

    const handleUsernameUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameForm.username })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al actualizar usuario');
                return;
            }

            setSuccess('Usuario actualizado correctamente');
            // Update session with new username
            await update({ username: usernameForm.username });
            setTimeout(() => {
                router.refresh();
            }, 1000);
        } catch (err) {
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al cambiar contraseña');
                return;
            }

            setSuccess('Contraseña actualizada correctamente');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-16">
            <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="mb-6">
                    <Link href="/" className="text-accent hover:underline text-sm">
                        ← Volver al catálogo
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-accent">Mi Perfil</h1>
                <p className="text-secondary mb-8">Administra tu cuenta y configuración</p>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-[var(--bg-secondary)]">
                    <button
                        onClick={() => setActiveTab('username')}
                        className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'username'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-secondary hover:text-white'
                            }`}
                    >
                        Nombre de Usuario
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'password'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-secondary hover:text-white'
                            }`}
                    >
                        Cambiar Contraseña
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 rounded" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgb(239, 68, 68)'
                    }}>
                        <p className="text-sm" style={{ color: 'rgb(248, 113, 113)' }}>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded" style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgb(34, 197, 94)'
                    }}>
                        <p className="text-sm" style={{ color: 'rgb(74, 222, 128)' }}>{success}</p>
                    </div>
                )}

                {/* Username Tab */}
                {activeTab === 'username' && (
                    <form onSubmit={handleUsernameUpdate}>
                        <div className="form-group">
                            <label className="form-label">Nombre de Usuario</label>
                            <input
                                type="text"
                                className="form-input"
                                value={usernameForm.username}
                                onChange={(e) => setUsernameForm({ username: e.target.value })}
                                required
                                disabled={loading}
                                minLength={3}
                            />
                            <p className="text-xs text-secondary mt-1">Mínimo 3 caracteres</p>
                        </div>

                        <div className="text-sm text-secondary mb-4">
                            <p>Usuario actual: <span className="text-accent font-medium">{session.user.username}</span></p>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Guardando...' : 'Actualizar Usuario'}
                        </button>
                    </form>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="form-group">
                            <label className="form-label">Contraseña Actual</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nueva Contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <p className="text-xs text-secondary mt-1">Mínimo 6 caracteres</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
