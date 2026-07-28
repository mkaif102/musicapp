import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadSong, removeCachedSong } from './offlineCache';

const LIKED_KEY = '@liked_songs';

    // boolean;
export interface LikedSong {
    id: string;
    title: string;
    artist: string;
    artwork: string;
    duration: string;
    url: string;
    album?: string;
    genre?: string;
    likes?: number;
    cachedPath?: string;
}

export const getLikedSongs = async (): Promise<LikedSong[]> => {
    try {
        const data = await AsyncStorage.getItem(LIKED_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const isSongLiked = async (songId: string): Promise<boolean> => {
    try {
        const songs = await getLikedSongs();
        return songs.some((s) => s.id === songId);
    } catch {
        return false;
    }
};

export const toggleLikeSong = async (song: LikedSong): Promise<boolean> => {
    try {
        const songs = await getLikedSongs();
        const index = songs.findIndex((s) => s.id === song.id);
        if (index >= 0) {
            const removed = songs.splice(index, 1)[0];
            await AsyncStorage.setItem(LIKED_KEY, JSON.stringify(songs));
            removeCachedSong(removed.id);
            return false;
        } else {
            songs.unshift(song);
            await AsyncStorage.setItem(LIKED_KEY, JSON.stringify(songs));
            downloadSong(song.id, song.url).then(async (cachedPath) => {
                if (cachedPath) {
                    const updatedSongs = await getLikedSongs();
                    const idx = updatedSongs.findIndex((s) => s.id === song.id);
                    if (idx >= 0) {
                        updatedSongs[idx].cachedPath = cachedPath;
                        await AsyncStorage.setItem(LIKED_KEY, JSON.stringify(updatedSongs));
                    }
                }
            });
            return true;
        }
    } catch {
        return false;
    }
};

export const getLikedCount = async (): Promise<number> => {
    try {
        const songs = await getLikedSongs();
        return songs.length;
    } catch {
        return 0;
    }
};
