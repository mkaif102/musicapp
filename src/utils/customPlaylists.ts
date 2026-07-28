import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@custom_playlists';

export interface CustomPlaylistSong {
    id: string;
    title: string;
    artist: string;
    artwork: string;
    duration: string;
    url: string;
    album: string;
}

export interface CustomPlaylist {
    id: string;
    name: string;
    songs: CustomPlaylistSong[];
    createdAt: string;
    color: string;
}

const COLORS = ['#1DB954', '#FF6B6B', '#6C63FF', '#4ECDC4', '#FFA07A', '#FFD93D', '#E040FB', '#00BCD4'];

export const getCustomPlaylists = async (): Promise<CustomPlaylist[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const createCustomPlaylist = async (name: string): Promise<CustomPlaylist> => {
    const playlists = await getCustomPlaylists();
    const newPlaylist: CustomPlaylist = {
        id: `custom_${Date.now()}`,
        name,
        songs: [],
        createdAt: new Date().toISOString(),
        color: COLORS[playlists.length % COLORS.length],
    };
    playlists.unshift(newPlaylist);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    return newPlaylist;
};

export const addSongsToPlaylist = async (playlistId: string, songs: CustomPlaylistSong[]): Promise<CustomPlaylist | null> => {
    const playlists = await getCustomPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index < 0) return null;
    const existingIds = new Set(playlists[index].songs.map(s => s.id));
    const newSongs = songs.filter(s => !existingIds.has(s.id));
    playlists[index].songs = [...playlists[index].songs, ...newSongs];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    return playlists[index];
};

export const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<CustomPlaylist | null> => {
    const playlists = await getCustomPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index < 0) return null;
    playlists[index].songs = playlists[index].songs.filter(s => s.id !== songId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
    return playlists[index];
};

export const deleteCustomPlaylist = async (playlistId: string): Promise<boolean> => {
    try {
        const playlists = await getCustomPlaylists();
        const filtered = playlists.filter(p => p.id !== playlistId);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch {
        return false;
    }
};
