// utils/recentlyPlayedUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRecentlyPlayed, type RecentSong } from './recentlyPlayed';

const RECENTLY_PLAYED_KEY = '@recently_played';

/**
 * Remove a single song from recently played history
 * @param songId - ID of the song to remove
 */
export const removeSongFromRecentlyPlayed = async (songId: string): Promise<void> => {
    try {
        const recent = await getRecentlyPlayed();
        const filtered = recent.filter(song => song.id !== songId);
        await AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.log('Error removing song from recently played:', error);
        throw error;
    }
};

/**
 * Remove multiple songs from recently played history
 * @param songIds - Array of song IDs to remove
 */
export const removeMultipleSongsFromRecentlyPlayed = async (songIds: string[]): Promise<void> => {
    try {
        const recent = await getRecentlyPlayed();
        const idsToRemove = new Set(songIds);
        const filtered = recent.filter(song => !idsToRemove.has(song.id));
        await AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.log('Error removing multiple songs from recently played:', error);
        throw error;
    }
};

/**
 * Remove all songs from recently played history
 * (Alias for clearRecentlyPlayed)
 */
export const clearAllRecentlyPlayed = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(RECENTLY_PLAYED_KEY);
    } catch (error) {
        console.log('Error clearing all recently played:', error);
        throw error;
    }
};

/**
 * Get the count of recently played songs
 */
export const getRecentlyPlayedCount = async (): Promise<number> => {
    try {
        const recent = await getRecentlyPlayed();
        return recent.length;
    } catch (error) {
        console.log('Error getting recently played count:', error);
        return 0;
    }
};

/**
 * Check if a specific song exists in recently played
 * @param songId - ID of the song to check
 */
export const isSongInRecentlyPlayed = async (songId: string): Promise<boolean> => {
    try {
        const recent = await getRecentlyPlayed();
        return recent.some(song => song.id === songId);
    } catch (error) {
        console.log('Error checking song in recently played:', error);
        return false;
    }
};