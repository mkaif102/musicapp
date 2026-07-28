import RNFS from 'react-native-fs';

const CACHE_DIR = `${RNFS.DocumentDirectoryPath}/liked_songs_cache`;

const ensureCacheDir = async () => {
    const exists = await RNFS.exists(CACHE_DIR);
    if (!exists) {
        await RNFS.mkdir(CACHE_DIR);
    }
};

const sanitizeFilename = (id: string): string => {
    return id.replace(/[^a-zA-Z0-9_-]/g, '_');
};

export const downloadSong = async (songId: string, url: string): Promise<string | null> => {
    try {
        if (!url || !songId) return null;
        await ensureCacheDir();
        const filename = `${sanitizeFilename(songId)}.mp3`;
        const destPath = `${CACHE_DIR}/${filename}`;

        const exists = await RNFS.exists(destPath);
        if (exists) return destPath;

        const result = await RNFS.downloadFile({
            fromUrl: url,
            toFile: destPath,
        }).promise;

        if (result.statusCode === 200) {
            return destPath;
        }
        return null;
    } catch (error) {
        console.log('Error downloading song:', error);
        return null;
    }
};

export const getCachedPath = async (songId: string): Promise<string | null> => {
    try {
        await ensureCacheDir();
        const filename = `${sanitizeFilename(songId)}.mp3`;
        const filePath = `${CACHE_DIR}/${filename}`;
        const exists = await RNFS.exists(filePath);
        return exists ? filePath : null;
    } catch {
        return null;
    }
};

export const isSongCached = async (songId: string): Promise<boolean> => {
    const path = await getCachedPath(songId);
    return path !== null;
};

export const removeCachedSong = async (songId: string): Promise<void> => {
    try {
        await ensureCacheDir();
        const filename = `${sanitizeFilename(songId)}.mp3`;
        const filePath = `${CACHE_DIR}/${filename}`;
        const exists = await RNFS.exists(filePath);
        if (exists) {
            await RNFS.unlink(filePath);
        }
    } catch (error) {
        console.log('Error removing cached song:', error);
    }
};

export const getOfflineUrl = async (songId: string, remoteUrl: string): Promise<string> => {
    const cached = await getCachedPath(songId);
    return cached || remoteUrl;
};
