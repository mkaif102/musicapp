/**
 * songs.ts — Central song data and utility functions
 *
 * This file provides CC-licensed fallback songs used when the JioSaavn API is unavailable.
 * This file replaces the old songs.json import.
 * Every function here works the same as before — screens don't need to change
 * how they call these functions, only the underlying data has changed.
 */

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

/**
 * Fallback songs — used when the JioSaavn API is unavailable.
 * These are CC-licensed playable tracks from SoundHelix (no auth needed).
 */
const allSongs: Song[] = [
    {
        id: 'jam-fb-1', title: 'Electric Dreams', artist: 'Synthwave Collective',
        album: 'Neon Nights', duration: '3:45', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=300&auto=format&fit=crop',
        genre: 'Electronic', mood: 'Energizing',
    },
    {
        id: 'jam-fb-2', title: 'Midnight Pulse', artist: 'Bass Theory',
        album: 'After Dark', duration: '4:12', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        artwork: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=300&auto=format&fit=crop',
        genre: 'Electronic', mood: 'Chill',
    },
    {
        id: 'jam-fb-3', title: 'Ocean Breeze', artist: 'Chill Horizon',
        album: 'Seaside Sessions', duration: '3:28', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        artwork: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=300&auto=format&fit=crop',
        genre: 'Lofi', mood: 'Peaceful',
    },
    {
        id: 'jam-fb-4', title: 'Neon Skyline', artist: 'Retro Wave',
        album: 'City Lights', duration: '4:05', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
        genre: 'Pop', mood: 'Uplifting',
    },
    {
        id: 'jam-fb-5', title: 'Velvet Shadows', artist: 'Luna Echo',
        album: 'Dreamscape', duration: '3:52', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
        genre: 'Ambient', mood: 'Chill',
    },
    {
        id: 'jam-fb-6', title: 'Solar Flare', artist: 'Cosmic Dust',
        album: 'Stellar', duration: '3:34', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
        genre: 'Electronic', mood: 'Energizing',
    },
    {
        id: 'jam-fb-7', title: 'Deep Currents', artist: 'Aqua Sound',
        album: 'Underwater', duration: '4:22', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        artwork: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=300&auto=format&fit=crop',
        genre: 'Ambient', mood: 'Peaceful',
    },
    {
        id: 'jam-fb-8', title: 'Golden Hour', artist: 'Sunset Vibes',
        album: 'Twilight', duration: '3:18', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        artwork: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=300&auto=format&fit=crop',
        genre: 'Pop', mood: 'Happy',
    },
    {
        id: 'jam-fb-9', title: 'Pulse Drive', artist: 'Electro Bloom',
        album: 'Voltage', duration: '3:41', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        artwork: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=300&auto=format&fit=crop',
        genre: 'Electronic', mood: 'Rowdy',
    },
    {
        id: 'jam-fb-10', title: 'Crystal Waves', artist: 'Ambient Lake',
        album: 'Serenity', duration: '4:55', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        artwork: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop',
        genre: 'Classical', mood: 'Peaceful',
    },
    {
        id: 'jam-fb-11', title: 'Thunder Road', artist: 'Storm Riders',
        album: 'Rebel Heart', duration: '3:27', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        artwork: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop',
        genre: 'Hip-Hop', mood: 'Defiant',
    },
    {
        id: 'jam-fb-12', title: 'Starlight Avenue', artist: 'Nova Beat',
        album: 'Infinity', duration: '3:58', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
        genre: 'Pop', mood: 'Romantic',
    },
    {
        id: 'jam-fb-13', title: 'Rhythm Garden', artist: 'Green Valley',
        album: 'Nature Code', duration: '4:10', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        artwork: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=300&auto=format&fit=crop',
        genre: 'Lofi', mood: 'Focused',
    },
    {
        id: 'jam-fb-14', title: 'Phantom Groove', artist: 'Dark Matter',
        album: 'Void', duration: '3:36', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
        artwork: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=300&auto=format&fit=crop',
        genre: 'Electronic', mood: 'Rowdy',
    },
    {
        id: 'jam-fb-15', title: 'Aurora Beat', artist: 'Northern Lights',
        album: 'Arctic Sessions', duration: '4:02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
        artwork: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=300&auto=format&fit=crop',
        genre: 'Lofi', mood: 'Chill',
    },
    {
        id: 'jam-fb-16', title: 'Desert Wind', artist: 'Sand Storm',
        album: 'Oasis', duration: '3:49', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
        artwork: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop',
        genre: 'Electronic', mood: 'Energizing',
    },
    {
        id: 'jam-fb-17', title: 'Urban Jungle', artist: 'Metro Pulse',
        album: 'Street Beats', duration: '3:22', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
        artwork: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=300&auto=format&fit=crop',
        genre: 'Hip-Hop', mood: 'Energizing',
    },
    {
        id: 'jam-fb-18', title: 'Silk Road', artist: 'Eastern Wind',
        album: 'Journey East', duration: '4:30', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3',
        artwork: 'https://images.unsplash.com/photo-1484755560693-a4074577af3a?q=80&w=300&auto=format&fit=crop',
        genre: 'Classical', mood: 'Peaceful',
    },
    {
        id: 'jam-fb-19', title: 'Pixel Rain', artist: 'Digital Forest',
        album: 'Cyberia', duration: '3:15', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3',
        artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300&auto=format&fit=crop',
        genre: 'Electronic', mood: 'Fun',
    },
    {
        id: 'jam-fb-20', title: 'Gravity Well', artist: 'Orbit Sound',
        album: 'Space Echo', duration: '4:18', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3',
        artwork: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop',
        genre: 'Ambient', mood: 'Focused',
    },
    // Above: CC-licensed fallback songs (used when JioSaavn API is offline)
];

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
    const plColors = ['#FF6B6B', '#6C63FF', '#4ECDC4', '#FFA07A'];
    const emojis = ['🎤', '🎵', '🌙', '🎶'];

    return topArtists.map((artist, index) => {
        const artistSongs = getSongsByArtist(artist.name);
        return {
            id: `playlist-${index + 1}`,
            title: `${artist.name} Hits`,
            songs: `${artistSongs.length} songs`,
            artist: artist.name,
            color: plColors[index % plColors.length],
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
