import dbConnect from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Get user by username
export async function getUserByUsername(username) {
    await dbConnect();
    const user = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, 'i') } // Case insensitive search
    }).lean();

    if (!user) return null;

    return {
        ...user,
        id: user._id.toString(),
        _id: undefined
    };
}

// Get user by ID
export async function getUserById(id) {
    await dbConnect();
    try {
        const user = await User.findById(id).lean();
        if (!user) return null;
        return {
            ...user,
            id: user._id.toString(),
            _id: undefined
        };
    } catch (error) {
        return null;
    }
}

// Create new user
export async function createUser(username, password) {
    await dbConnect();

    // Check if username already exists (handled by unique index too, but good for custom error)
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is the first user
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Create new user with default 'user' role, or 'owner' if first user
    const newUser = await User.create({
        username: username.trim(),
        password: hashedPassword,
        isAdmin: isFirstUser,
        role: isFirstUser ? 'owner' : 'user'
    });

    // Return user without password
    const userObj = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return {
        ...userWithoutPassword,
        id: userObj._id.toString(),
        _id: undefined
    };
}

// Validate user password
export async function validatePassword(user, password) {
    // User object from DB has 'password' field (hashed)
    if (!user || !user.password) return false;
    return await bcrypt.compare(password, user.password);
}

// Update user profile
export async function updateUser(userId, updates) {
    await dbConnect();

    // If updating username, check uniqueness
    if (updates.username) {
        const existingUser = await getUserByUsername(updates.username);
        if (existingUser && existingUser.id !== userId) {
            throw new Error('Username already taken');
        }
    }

    const updateFields = {};
    if (updates.username) updateFields.username = updates.username.trim();
    // Map role to isAdmin for now if needed, or just store role string if schema allows
    // The schema has isAdmin boolean. The previous code had 'role' string.
    // Let's support 'role' update by mapping it if necessary, or just ignore for now to be safe.
    // If the schema only has isAdmin, we should stick to that or update schema.
    // For now, let's assume we might update isAdmin if passed.

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true }
    ).lean();

    if (!user) throw new Error('User not found');

    const { password: _, ...userWithoutPassword } = user;
    return {
        ...userWithoutPassword,
        id: user._id.toString(),
        _id: undefined
    };
}

// Change user password
export async function changePassword(userId, oldPassword, newPassword) {
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
        throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return true;
}

// Get all users (for admin)
export async function getAllUsers() {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return users.map(user => ({
        ...user,
        id: user._id.toString(),
        _id: undefined
    }));
}

// Delete user
export async function deleteUser(userId) {
    await dbConnect();
    const result = await User.deleteOne({ _id: userId });
    return result.deletedCount > 0;
}
