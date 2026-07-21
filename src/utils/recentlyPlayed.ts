import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@recently_played';
const MAX_RECENT = 50;

export interface RecentSong {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: string;
    url: string;
    artwork: string;
    playedAt: number;
}

export const saveToRecentlyPlayed = async (song: Omit<RecentSong, 'playedAt'>): Promise<void> => {
    try {
        const existing = await getRecentlyPlayed();
        const filtered = existing.filter(s => s.title !== song.title);
        const updated: RecentSong[] = [
            { ...song, playedAt: Date.now() },
            ...filtered,
        ].slice(0, MAX_RECENT);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.log('Error saving to recently played:', error);
    }
};

export const getRecentlyPlayed = async (): Promise<RecentSong[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.log('Error getting recently played:', error);
        return [];
    }
};

export const clearRecentlyPlayed = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.log('Error clearing recently played:', error);
    }
};
