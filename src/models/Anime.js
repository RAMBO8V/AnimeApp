import mongoose from 'mongoose';

const AnimeSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    episodes: {
        type: Number,
        required: true,
    },
    seasons: {
        type: Number,
        required: true,
    },
    season_distribution: {
        type: [Number],
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ['En Emisión', 'Finalizado', 'Próximamente'],
    },
    cover: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // Since animes are private per user in this app's logic, we can store progress directly here
    watched_episodes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Compound index to ensure a user doesn't add the same anime twice? 
// Maybe not necessary, but good for performance if searching by owner
AnimeSchema.index({ owner: 1 });

export default mongoose.models.Anime || mongoose.model('Anime', AnimeSchema);
