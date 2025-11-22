import dbConnect from './db';
import Anime from '@/models/Anime';

export async function getAnimes(userId) {
    if (!userId) return [];
    await dbConnect();
    // Convert string ID to ObjectId if necessary, but Mongoose handles strings usually
    const animes = await Anime.find({ owner: userId }).sort({ createdAt: -1 }).lean();

    // Map _id to id for frontend compatibility
    return animes.map(anime => ({
        ...anime,
        id: anime._id.toString(),
        _id: undefined
    }));
}

export async function getAnimeById(userId, id) {
    await dbConnect();
    try {
        const anime = await Anime.findOne({ _id: id, owner: userId }).lean();
        if (!anime) return null;
        return {
            ...anime,
            id: anime._id.toString(),
            _id: undefined
        };
    } catch (error) {
        return null;
    }
}

export async function saveAnime(userId, animeData) {
    if (!userId) throw new Error('User ID required');
    await dbConnect();

    const newAnime = await Anime.create({
        ...animeData,
        owner: userId
    });

    return {
        ...newAnime.toObject(),
        id: newAnime._id.toString(),
        _id: undefined
    };
}

export async function updateAnime(userId, id, updatedData) {
    if (!userId) throw new Error('User ID required');
    await dbConnect();

    const anime = await Anime.findOneAndUpdate(
        { _id: id, owner: userId },
        updatedData,
        { new: true, runValidators: true }
    ).lean();

    if (!anime) return null;

    return {
        ...anime,
        id: anime._id.toString(),
        _id: undefined
    };
}

export async function deleteAnime(userId, id) {
    if (!userId) throw new Error('User ID required');
    await dbConnect();

    const result = await Anime.deleteOne({ _id: id, owner: userId });
    return result.deletedCount > 0;
}

export async function deleteAllAnimesFromUser(userId) {
    if (!userId) return false;
    await dbConnect();
    await Anime.deleteMany({ owner: userId });
    return true;
}
