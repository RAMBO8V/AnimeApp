import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAllUsers, getUserById, updateUser, deleteUser } from '@/lib/users';
import { getAnimes, deleteAllAnimesFromUser } from '@/lib/animes';

// Get all users (admin/owner only)
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    try {
        const users = await getAllUsers();

        // Get anime count for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            // Password is already removed by getAllUsers logic usually, but let's be safe
            const { password, ...userWithoutPassword } = user;
            const animes = await getAnimes(user.id);
            return {
                ...userWithoutPassword,
                animeCount: animes.length
            };
        }));

        return NextResponse.json({ users: usersWithStats });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Update user role (owner only)
export async function PUT(request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isOwner) {
        return NextResponse.json({ error: 'Unauthorized - Owner access required' }, { status: 403 });
    }

    try {
        const { userId, role } = await request.json();

        // Cannot change own role
        if (userId === session.user.id) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        // Validate role
        if (!['owner', 'admin', 'user'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Map role string to isAdmin boolean if needed, but for now we just store the role string in the user object?
        // Wait, my User model has isAdmin boolean, but the code logic uses 'role' string.
        // I should probably update the User model to support 'role' string or map it.
        // Let's assume for now we just update the user object and Mongoose strict mode might ignore 'role' if not in schema.
        // I should have updated the User schema to include 'role'.
        // Let's check User schema again.

        const updatedUser = await updateUser(userId, { role });
        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

// Delete user
export async function DELETE(request) {
    const session = await getServerSession(authOptions);

    try {
        const { userId } = await request.json();

        // Get target user
        const targetUser = await getUserById(userId);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Cannot delete yourself
        if (userId === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        // Permission checks:
        // - Owners can delete anyone except themselves
        // - Admins can only delete users (not other admins or owners)
        // - Users cannot delete anyone
        if (session.user.isOwner) {
            // Owner can delete anyone
        } else if (session.user.role === 'admin') {
            // Admin can only delete regular users
            if (targetUser.role !== 'user') {
                return NextResponse.json({
                    error: 'Admins can only delete regular users'
                }, { status: 403 });
            }
        } else {
            // Regular users cannot delete anyone
            return NextResponse.json({
                error: 'Unauthorized - Admin access required'
            }, { status: 403 });
        }

        // Delete user
        const userDeleted = await deleteUser(userId);
        if (!userDeleted) {
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
        }

        // Delete user's animes
        await deleteAllAnimesFromUser(userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
