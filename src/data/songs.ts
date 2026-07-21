import songsJson from './songs.json';

export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: string;
    url: string;
    artwork?: string;
    track_id?: number;
    genre?: string;
    mood?: string;
    play_count?: number;
    description?: string;
    release_date?: string;
    bpm?: number;
    musical_key?: string;
}

const albumGenreMap: { [key: string]: string } = {
    'Afsanay': 'Hip-Hop',
    'Gumaan': 'Hip-Hop',
    'Downers At Dusk': 'Hip-Hop',
    'Pain Killers': 'Hip-Hop',
    'Kya Tumhe Pata Hai': 'Pop',
    'Aisay Kaisay': 'Pop',
    'Woh': 'Pop',
    'Mann': 'Pop',
    'Sukoon': 'Pop',
    'Sad Vibes': 'Sad',
    'Romantic Urdu': 'Romantic',
    'Hip-Hop Energy': 'Hip-Hop',
    'Chill Lofi': 'Lofi',
    'Party Mix': 'Party',
    'Oceans': 'Ambient',
    'Sunsets': 'Lofi',
    'Energy': 'Workout',
    'Iron': 'Workout',
    'Power': 'Workout',
    'Focus': 'Focus',
    'Zen': 'Meditation',
    'Library': 'Lofi',
    'Party': 'Party',
    'Bass': 'Electronic',
    'Rain': 'Ambient',
    'Night': 'Ambient',
    'Soft': 'Classical',
    'Roads': 'Pop',
    'Summer': 'Pop',
    'Journey': 'Pop',
};

const albumMoodMap: { [key: string]: string } = {
    'Afsanay': 'Defiant',
    'Gumaan': 'Melancholy',
    'Downers At Dusk': 'Chill',
    'Pain Killers': 'Energizing',
    'Kya Tumhe Pata Hai': 'Romantic',
    'Aisay Kaisay': 'Chill',
    'Woh': 'Melancholy',
    'Mann': 'Peaceful',
    'Sukoon': 'Peaceful',
    'Sad Vibes': 'Sad',
    'Romantic Urdu': 'Romantic',
    'Hip-Hop Energy': 'Energizing',
    'Chill Lofi': 'Chill',
    'Party Mix': 'Fun',
    'Oceans': 'Peaceful',
    'Sunsets': 'Peaceful',
    'Energy': 'Energizing',
    'Iron': 'Energizing',
    'Power': 'Energizing',
    'Focus': 'Focused',
    'Zen': 'Peaceful',
    'Library': 'Chill',
    'Party': 'Fun',
    'Bass': 'Rowdy',
    'Rain': 'Peaceful',
    'Night': 'Chill',
    'Soft': 'Peaceful',
    'Roads': 'Uplifting',
    'Summer': 'Happy',
    'Journey': 'Uplifting',
};

const allSongs: Song[] = songsJson.songs.map((track: any) => ({
    id: track.id,
    title: track.name,
    artist: track.artist,
    album: track.album,
    duration: track.duration,
    url: track.url,
    artwork: track.artwork,
    genre: albumGenreMap[track.album] || 'Other',
    mood: albumMoodMap[track.album] || 'Chill',
    play_count: 0,
    description: '',
    release_date: '',
    bpm: 0,
    musical_key: '',
}));

export const getAllSongs = (): Song[] => allSongs;

export const getSongById = (id: string): Song | undefined => {
    return allSongs.find(song => song.id === id);
};

export const getSongByName = (name: string): Song | undefined => {
    return allSongs.find(song =>
        song.title.toLowerCase().includes(name.toLowerCase())
    );
};

export const getSongsByArtist = (artistName: string): Song[] => {
    if (!artistName) return [];
    return allSongs.filter(song =>
        song.artist.toLowerCase().includes(artistName.toLowerCase())
    );
};

export const getSongsByGenre = (genre: string): Song[] => {
    if (!genre) return [];
    return allSongs.filter(song =>
        song.genre?.toLowerCase().includes(genre.toLowerCase())
    );
};

export const getSongsByMood = (mood: string): Song[] => {
    if (!mood) return [];
    return allSongs.filter(song =>
        song.mood?.toLowerCase().includes(mood.toLowerCase())
    );
};

export const getTopSongs = (limit: number = 10): Song[] => {
    return [...allSongs]
        .filter(song => song.play_count && song.play_count > 0)
        .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
        .slice(0, limit);
};

export const getRecentlyAdded = (limit: number = 8): Song[] => {
    return allSongs.slice(0, limit);
};

export const getRecentlyPlayed = (): Song[] => {
    return allSongs.slice(0, 8);
};

export const getUniqueArtists = (): { name: string; songCount: number }[] => {
    const map = new Map<string, number>();
    allSongs.forEach(song => {
        map.set(song.artist, (map.get(song.artist) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, songCount]) => ({ name, songCount }));
};

export const getUniqueGenres = (): { name: string; songCount: number }[] => {
    const map = new Map<string, number>();
    allSongs.forEach(song => {
        const g = song.genre || 'Other';
        map.set(g, (map.get(g) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, songCount]) => ({ name, songCount }));
};

export const getUniqueMoods = (): { name: string; songCount: number }[] => {
    const map = new Map<string, number>();
    allSongs.forEach(song => {
        const m = song.mood || 'Chill';
        map.set(m, (map.get(m) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, songCount]) => ({ name, songCount }));
};

export const searchSongs = (query: string): Song[] => {
    if (!query) return allSongs;
    const q = query.toLowerCase().trim();
    return allSongs.filter(song =>
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.genre?.toLowerCase().includes(q) ||
        song.mood?.toLowerCase().includes(q)
    );
};

export const getFeaturedPlaylists = () => {
    const artists = getUniqueArtists();
    const topArtists = artists.slice(0, 4);

    return topArtists.map((artist, index) => {
        const artistSongs = getSongsByArtist(artist.name);
        const colors = ['#FF6B6B', '#6C63FF', '#4ECDC4', '#FFA07A'];
        const emojis = ['🎤', '🎵', '🌙', '🎶'];

        return {
            id: `playlist-${index + 1}`,
            title: `${artist.name} Hits`,
            songs: `${artistSongs.length} songs`,
            artist: artist.name,
            color: colors[index % colors.length],
            subtitle: `Best of ${artist.name}`,
            emoji: emojis[index % emojis.length],
            trackList: artistSongs,
        };
    });
};

export const getStats = () => {
    const totalTracks = allSongs.length;
    const totalPlays = allSongs.reduce((sum, song) => sum + (song.play_count || 0), 0);
    const uniqueArtists = getUniqueArtists().length;
    const uniqueGenres = getUniqueGenres().length;
    const avgDuration = totalTracks > 0
        ? Math.round(allSongs.reduce((sum, s) => sum + (s.duration ? parseDuration(s.duration) : 0), 0) / totalTracks)
        : 0;

    return {
        totalTracks,
        totalPlays,
        uniqueArtists,
        uniqueGenres,
        avgDuration,
        mostPlayed: getTopSongs(1)[0] || null,
    };
};

export const parseDuration = (duration: string): number => {
    if (!duration) return 0;
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
};

export const songToTrack = (song: Song) => ({
    id: song.id,
    url: song.url,
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: parseDuration(song.duration),
    artwork: song.artwork,
});

export default {
    getAllSongs,
    getSongById,
    getSongByName,
    getSongsByArtist,
    getSongsByGenre,
    getSongsByMood,
    getTopSongs,
    getRecentlyAdded,
    getRecentlyPlayed,
    getUniqueArtists,
    getUniqueGenres,
    getUniqueMoods,
    searchSongs,
    getFeaturedPlaylists,
    getStats,
    songToTrack,
    parseDuration,
};