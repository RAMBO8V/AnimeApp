import { NextResponse } from 'next/server';
import { createUser } from '@/lib/users';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        // Validation
        if (!username || !password) {
            return NextResponse.json(
                { error: 'El usuario y la contraseña son requeridos' },
                { status: 400 }
            );
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: 'El usuario debe tener al menos 3 caracteres' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            );
        }

        const user = await createUser(username, password);
        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        if (error.message === 'Username already exists') {
            return NextResponse.json(
                { error: 'El nombre de usuario ya existe' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
