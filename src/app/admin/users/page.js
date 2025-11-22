'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [roleLoading, setRoleLoading] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && !session?.user?.isAdmin) {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchUsers();
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId, username) => {
        if (!confirm(`¿Estás seguro de eliminar al usuario "${username}"? Todos sus animes también serán eliminados.`)) {
            return;
        }

        setDeleteLoading(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await res.json();

            if (res.ok) {
                // Refresh the list
                await fetchUsers();
            } else {
                alert(data.error || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error al eliminar usuario');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setRoleLoading(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });

            const data = await res.json();

            if (res.ok) {
                // Refresh the list
                await fetchUsers();
            } else {
                alert(data.error || 'Error al cambiar rol');
            }
        } catch (error) {
            console.error('Error changing role:', error);
            alert('Error al cambiar rol');
        } finally {
            setRoleLoading(null);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'owner': return 'var(--role-owner, #FFD700)';
            case 'admin': return 'var(--role-admin, #a78bfa)';
            case 'user': return 'var(--role-user, #60a5fa)';
            default: return 'var(--text-secondary)';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'owner': return '👑 Dueño';
            case 'admin': return '⚡ Admin';
            case 'user': return '👤 Usuario';
            default: return role;
        }
    };

    const canDelete = (targetRole) => {
        if (session?.user?.isOwner) return true;
        if (session?.user?.role === 'admin' && targetRole === 'user') return true;
        return false;
    };

    if (loading || status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                    <p className="mt-4 text-secondary">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-purple-400 text-transparent bg-clip-text">
                    👥 Gestión de Usuarios
                </h1>
                <p className="text-secondary">
                    {session?.user?.isOwner ?
                        'Administra usuarios, roles y permisos del sistema' :
                        'Administra usuarios regulares'}
                </p>
            </div>

            <div className="grid gap-4">
                {users.map(user => {
                    const isCurrentUser = user.id === session?.user?.id;
                    const canDeleteUser = !isCurrentUser && canDelete(user.role);
                    const isRoleLoading = roleLoading === user.id;
                    const isDeleting = deleteLoading === user.id;

                    return (
                        <div
                            key={user.id}
                            className="p-6 rounded-lg border border-[var(--card-border)] bg-[var(--bg-secondary)] hover:border-accent transition-all"
                            style={{
                                boxShadow: isCurrentUser ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none'
                            }}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-white">
                                            {user.username}
                                            {isCurrentUser && (
                                                <span className="ml-2 text-sm text-accent font-normal">(Tú)</span>
                                            )}
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-secondary">
                                        <span>📚 {user.animeCount} animes</span>
                                        <span>📅 Desde {new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Role selector - only shown to owner */}
                                    {session?.user?.isOwner && !isCurrentUser ? (
                                        <select
                                            value={user.role || 'user'}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            disabled={isRoleLoading}
                                            className="form-select text-sm px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--bg-primary)] cursor-pointer"
                                            style={{
                                                color: getRoleColor(user.role),
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <option value="user">👤 Usuario</option>
                                            <option value="admin">⚡ Admin</option>
                                            <option value="owner">👑 Dueño</option>
                                        </select>
                                    ) : (
                                        <div
                                            className="px-4 py-2 rounded-lg font-semibold text-sm"
                                            style={{
                                                color: getRoleColor(user.role),
                                                backgroundColor: getRoleColor(user.role) + '20',
                                                border: `1px solid ${getRoleColor(user.role)}40`
                                            }}
                                        >
                                            {getRoleLabel(user.role)}
                                        </div>
                                    )}

                                    {/* Delete button */}
                                    {canDeleteUser && (
                                        <button
                                            onClick={() => handleDelete(user.id, user.username)}
                                            disabled={isDeleting}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDeleting ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {users.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-secondary text-lg">No hay usuarios registrados</p>
                </div>
            )}
        </div>
    );
}
