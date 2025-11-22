'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="nav-logo">
          ANIME<span className="text-white">CATALOG</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">
            Catálogo
          </Link>
          {session && (
            <Link href="/admin" className="nav-link">
              Agregar
            </Link>
          )}
          {session?.user?.isAdmin && (
            <Link href="/admin/users" className="nav-link">
              👥 Usuarios
            </Link>
          )}

          {status === 'loading' ? (
            <span className="nav-link">...</span>
          ) : session ? (
            <>
              <Link href="/profile" className="nav-link text-accent">
                👤 {session.user.username}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="nav-link cursor-pointer"
                style={{ background: 'none', border: 'none' }}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="nav-link text-accent">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
