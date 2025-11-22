import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateUser, changePassword } from '@/lib/users';

export async function PUT(request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { username, currentPassword, newPassword } = body;

        // If changing password
        if (currentPassword && newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { error: 'New password must be at least 6 characters' },
                    { status: 400 }
                );
            }

            try {
                await changePassword(session.user.id, currentPassword, newPassword);
                return NextResponse.json({
                    success: true,
                    message: 'Password updated successfully'
                });
            } catch (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                );
            }
        }

        // If updating username
        if (username) {
            if (username.length < 3) {
                return NextResponse.json(
                    { error: 'Username must be at least 3 characters' },
                    { status: 400 }
                );
            }

            try {
                const updatedUser = await updateUser(session.user.id, { username });
                return NextResponse.json({
                    success: true,
                    user: updatedUser
                });
            } catch (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'No valid updates provided' },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
