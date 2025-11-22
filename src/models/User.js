import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        maxlength: [60, 'Username cannot be more than 60 characters'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user',
    },
    // Watchlist embedded for future flexibility, though current app logic 
    // might store progress in the Anime model (since Anime is per-user).
    watchlist: [{
        animeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Anime'
        },
        watched_episodes: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            default: 'Plan to Watch'
        }
    }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
