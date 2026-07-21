import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Alert,
    Image,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';
import { useFocusEffect } from '@react-navigation/native';
import {
    songToTrack,
    type Song,
    getAllSongs,
    getUniqueArtists,
    getUniqueGenres,
    getUniqueMoods,
    getSongByName,
    getFeaturedPlaylists,
} from '../../data/songs';
import {
    saveToRecentlyPlayed,
    getRecentlyPlayed,
    type RecentSong,
} from '../../utils/recentlyPlayed';
import { colors } from '../../theme/Colors';

const { width } = Dimensions.get('window');
const RADIO_API = 'https://de1.api.radio-browser.info/json';

interface Artist {
    name: string;
    songCount: number;
}

interface Mood {
    name: string;
    songCount: number;
}

interface RecentItem {
    id: string;
    title: string;
    artist: string;
    artwork?: string;
    songRef: string;
}

interface RadioStation {
    stationuuid: string;
    name: string;
    url_resolved: string;
    favicon: string;
    tags: string;
    country: string;
    votes: number;
    clickcount: number;
    lastcheckok: number;
}

const GENRE_EMOJI: { [key: string]: string } = {
    'Hip-Hop': '🎤',
    'Pop': '🎵',
    'Sad': '😢',
    'Romantic': '❤️',
    'Lofi': '🎧',
    'Party': '🎉',
    'Ambient': '🌊',
    'Workout': '💪',
    'Focus': '🎯',
    'Meditation': '🧘',
    'Electronic': '⚡',
    'Classical': '🎻',
    'Other': '🎶',
};

const MOOD_EMOJI: { [key: string]: string } = {
    'Defiant': '😤',
    'Melancholy': '🌧️',
    'Chill': '❄️',
    'Energizing': '⚡',
    'Romantic': '❤️',
    'Peaceful': '☮️',
    'Sad': '😢',
    'Fun': '🎉',
    'Focused': '🎯',
    'Rowdy': '🔥',
    'Uplifting': '☀️',
    'Happy': '😊',
    'Unknown': '🎵',
};

const COLORS = ['#FF6B6B', '#6C63FF', '#4ECDC4', '#FFA07A', '#FFD93D', '#FF6B9D'];

const CATEGORIES = [
    { id: '1', title: 'Music' },
    { id: '2', title: 'Podcasts' },
    { id: '3', title: 'Radio' },
    { id: '4', title: 'Workout' },
    { id: '5', title: 'Focus Mood' },
];

const PLAYLIST_IMAGES = [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=300&auto=format&fit=crop',
];

const RADIO_IMAGES = [
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=200&auto=format&fit=crop',
];

const MIXES_IMAGES = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484755560693-a4074577af3a?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300&auto=format&fit=crop',
];

const PODCAST_IMAGES = [
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589903308904-1010c2294adc?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=300&auto=format&fit=crop',
];

const WORKOUT_IMAGES = [
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=300&auto=format&fit=crop',
];

const FOCUS_IMAGES = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=300&auto=format&fit=crop',
];

const FALLBACK_SONGS: Song[] = [
    {
        id: '1',
        title: 'Afsanay',
        artist: 'Talha Anjum',
        album: 'Afsanay',
        duration: '3:45',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        artwork: 'https://picsum.photos/seed/afsanay/300',
        genre: 'Hip-Hop',
        mood: 'Defiant',
    },
    {
        id: '2',
        title: 'Kya Tumhe Pata Hai',
        artist: 'Hasan Raheem',
        album: 'Kya Tumhe Pata Hai',
        duration: '3:20',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        artwork: 'https://picsum.photos/seed/kya/300',
        genre: 'Pop',
        mood: 'Romantic',
    },
    {
        id: '3',
        title: 'Mann',
        artist: 'Talwinder',
        album: 'Mann',
        duration: '3:50',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        artwork: 'https://picsum.photos/seed/mann/300',
        genre: 'Pop',
        mood: 'Peaceful',
    },
    {
        id: '4',
        title: 'Midnight Run',
        artist: 'Outer Banks',
        album: 'Night Vibes',
        duration: '4:10',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        artwork: 'https://picsum.photos/seed/midnight/300',
        genre: 'Electronic',
        mood: 'Energizing',
    },
    {
        id: '5',
        title: 'Chill Waves',
        artist: 'Lofi Collective',
        album: 'Lofi Sessions',
        duration: '3:30',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        artwork: 'https://picsum.photos/seed/chill/300',
        genre: 'Lofi',
        mood: 'Chill',
    },
    {
        id: '6',
        title: 'Deep Focus',
        artist: 'Study Beats',
        album: 'Concentration',
        duration: '5:00',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        artwork: 'https://picsum.photos/seed/focus/300',
        genre: 'Ambient',
        mood: 'Focused',
    },
    {
        id: '7',
        title: 'Pump It Up',
        artist: 'DJ Energy',
        album: 'Workout Mix',
        duration: '3:15',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        artwork: 'https://picsum.photos/seed/workout/300',
        genre: 'Electronic',
        mood: 'Energizing',
    },
    {
        id: '8',
        title: 'Sunset Drive',
        artist: 'Retro Wave',
        album: 'Neon Nights',
        duration: '4:20',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        artwork: 'https://picsum.photos/seed/sunset/300',
        genre: 'Pop',
        mood: 'Peaceful',
    },
];

const HomeScreen = ({ navigation }: any) => {
    const [userName, setUserName] = useState('Guest');
    const [artistImages, setArtistImages] = useState<{ [key: string]: string }>({});
    const [activeCategory, setActiveCategory] = useState('Music');
    const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
    const [recentPlayedSongs, setRecentPlayedSongs] = useState<RecentSong[]>([]);

    useEffect(() => {
        loadUserData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadRecentSongs();
        }, [])
    );

    const loadRecentSongs = async () => {
        const songs = await getRecentlyPlayed();
        setRecentPlayedSongs(songs);
    };

    useEffect(() => {
        const fetchRadioStations = async () => {
            try {
                const tags = ['pop', 'rock', 'jazz', 'hiphop', 'lofi', 'bollywood'];
                const results: RadioStation[] = [];
                for (const tag of tags.slice(0, 6)) {
                    const res = await fetch(
                        `${RADIO_API}/stations/search?tag=${tag}&hidebroken=true&order=clickcount&limit=1`,
                        { headers: { 'User-Agent': 'MusicApp/1.0' } }
                    );
                    const data = await res.json();
                    if (data.length > 0 && data[0].lastcheckok === 1) {
                        results.push(data[0]);
                    }
                }
                setRadioStations(results);
            } catch (error) {
                console.log('Error fetching radio stations:', error);
            }
        };
        fetchRadioStations();
    }, []);

    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setUserName(userData.userName || 'Guest');
            }
        } catch (error) {
            console.log('Error loading user data:', error);
        }
    };

    const allSongs: Song[] = useMemo(() => {
        try {
            const songs = getAllSongs();
            return (songs && songs.length > 0) ? songs : FALLBACK_SONGS;
        } catch (error) {
            return FALLBACK_SONGS;
        }
    }, []);

    const artists: Artist[] = useMemo(() => {
        try {
            const artistList = getUniqueArtists();
            if (artistList && artistList.length > 0) return artistList;
            const map = new Map<string, number>();
            allSongs.forEach(song => map.set(song.artist, (map.get(song.artist) || 0) + 1));
            return Array.from(map.entries()).map(([name, songCount]) => ({ name, songCount }));
        } catch (error) {
            const map = new Map<string, number>();
            allSongs.forEach(song => map.set(song.artist, (map.get(song.artist) || 0) + 1));
            return Array.from(map.entries()).map(([name, songCount]) => ({ name, songCount }));
        }
    }, [allSongs]);

    useEffect(() => {
        const fetchArtistImages = async () => {
            try {
                const images: { [key: string]: string } = {};
                const promises = artists.slice(0, 10).map(async (artist) => {
                    try {
                        const response = await fetch(
                            `https://api.deezer.com/search?q=${encodeURIComponent(artist.name)}&limit=1`
                        );
                        const json = await response.json();
                        if (json.data && json.data.length > 0) {
                            images[artist.name] = json.data[0].artist.picture_medium;
                        }
                    } catch (err) {
                        console.log(`Error fetching image for ${artist.name}:`, err);
                    }
                });
                await Promise.all(promises);
                setArtistImages(images);
            } catch (error) {
                console.log('Error fetching artist images:', error);
            }
        };
        fetchArtistImages();
    }, [artists]);

    const moods = useMemo((): Mood[] => {
        try {
            const moodList = getUniqueMoods();
            if (moodList && moodList.length > 0) {
                return moodList;
            }
            const map = new Map<string, number>();
            allSongs.forEach(song => {
                const m = song.mood || 'Chill';
                map.set(m, (map.get(m) || 0) + 1);
            });
            return Array.from(map.entries()).map(([name, songCount]) => ({ name, songCount }));
        } catch (error) {
            console.log('Error loading moods:', error);
            const map = new Map<string, number>();
            allSongs.forEach(song => {
                const m = song.mood || 'Chill';
                map.set(m, (map.get(m) || 0) + 1);
            });
            return Array.from(map.entries()).map(([name, songCount]) => ({ name, songCount }));
        }
    }, [allSongs]);

    const recentPlayed: RecentItem[] = useMemo(() => {
        if (recentPlayedSongs.length > 0) {
            return recentPlayedSongs.map((song, idx) => ({
                id: `rp-${idx}`,
                title: song.title || 'Unknown',
                artist: song.artist || 'Unknown Artist',
                artwork: song.artwork || PLAYLIST_IMAGES[idx % PLAYLIST_IMAGES.length],
                songRef: song.title,
            }));
        }
        return allSongs.slice(0, 8).map((song, idx) => ({
            id: `rp-${idx}`,
            title: song.title || 'Unknown',
            artist: song.artist || 'Unknown Artist',
            artwork: song.artwork || PLAYLIST_IMAGES[idx % PLAYLIST_IMAGES.length],
            songRef: song.title,
        }));
    }, [recentPlayedSongs, allSongs]);

    const workoutSongs = useMemo(() => {
        const filtered = allSongs.filter(s => {
            const g = (s.genre || '').toLowerCase();
            const m = (s.mood || '').toLowerCase();
            return g.includes('electronic') || g.includes('workout') || m.includes('energizing') || m.includes('rowdy');
        });
        return filtered.length > 0 ? filtered : allSongs.slice(0, 6);
    }, [allSongs]);

    const focusSongs = useMemo(() => {
        const filtered = allSongs.filter(s => {
            const g = (s.genre || '').toLowerCase();
            const m = (s.mood || '').toLowerCase();
            return g.includes('ambient') || g.includes('lofi') || g.includes('classical') || m.includes('peaceful') || m.includes('focused') || m.includes('chill');
        });
        return filtered.length > 0 ? filtered : allSongs.slice(0, 6);
    }, [allSongs]);

    const playPlaylist = async (tracks: Song[]) => {
        if (!tracks || tracks.length === 0) return;
        try {
            const validTracks = tracks
                .filter(song => song && song.url)
                .map(song => songToTrack(song));

            await TrackPlayer.reset();
            await TrackPlayer.add(validTracks);
            await TrackPlayer.play();
        } catch (error) {
            console.log(error);
        }
    };

    const playSong = async (song: Song) => {
        await saveToRecentlyPlayed({
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            url: song.url,
            artwork: song.artwork || 'https://picsum.photos/seed/song/400',
        });
        navigation.navigate('SongDetail', {
            song: {
                title: song.title, artist: song.artist,
                artwork: song.artwork || 'https://picsum.photos/seed/song/400',
                duration: song.duration, likes: (song as any).play_count || 0,
                album: song.album, genre: song.genre, url: song.url,
            },
        });
    };

    const handleQuickAction = (action: string) => {
        if (action === 'Liked Songs') {
            navigation.navigate('LikedSongs');
        } else if (action === 'Heavy Rotation') {
            playPlaylist(allSongs);
        } else {
            Alert.alert(action, `${action} is opening shortly!`);
        }
    };

    const renderRecentItem = ({ item }: { item: RecentItem }) => (
        <TouchableOpacity
            style={styles.recentCard}
            activeOpacity={0.8}
            onPress={() => {
                const fullSong = getSongByName(item.songRef);
                if (fullSong) {
                    navigation.navigate('SongDetail', {
                        song: {
                            title: fullSong.title,
                            artist: fullSong.artist,
                            artwork: fullSong.artwork || 'https://picsum.photos/seed/song/400',
                            duration: fullSong.duration,
                            likes: fullSong.play_count || 0,
                            album: fullSong.album,
                            genre: fullSong.genre,
                            url: fullSong.url,
                        },
                    });
                }
            }}
        >
            <View style={styles.recentImageContainer}>
                {item.artwork ? (
                    <Image source={{ uri: item.artwork }} style={styles.recentArt} />
                ) : (
                    <View style={styles.fallbackArtContainer}>
                        <Icon name="musical-notes-outline" size={30} color="#888888" />
                    </View>
                )}
            </View>
            <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
        </TouchableOpacity>
    );

    const renderArtistItem = ({ item }: { item: Artist }) => {
        const imageUrl = artistImages[item.name];
        return (
            <TouchableOpacity
                style={styles.artistCard}
                activeOpacity={0.8}
                onPress={() => {
                    console.log('Navigating to Artist:', item.name);
                    navigation.navigate('ArtistDetail', { artist: item.name });
                }}
            >
                <View style={styles.artistImage}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.artistImagePhoto} />
                    ) : (
                        <View style={styles.artistFallbackContainer}>
                            <Text style={styles.artistImageText}>🎤</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.artistLabel}>{item.songCount || 0} songs</Text>
            </TouchableOpacity>
        );
    };

    const renderSongItem = (song: Song, index: number, accent: string) => (
        <TouchableOpacity key={song.id} style={styles.songRow} activeOpacity={0.8} onPress={() => playSong(song)}>
            <Image source={{ uri: song.artwork || 'https://picsum.photos/seed/song/200' }} style={styles.songRowImage} />
            <View style={styles.songRowInfo}>
                <Text style={styles.songRowTitle} numberOfLines={1}>{song.title}</Text>
                <Text style={styles.songRowArtist} numberOfLines={1}>{song.artist}</Text>
            </View>
            <TouchableOpacity style={[styles.songRowPlay, { backgroundColor: accent }]} onPress={() => playSong(song)}>
                <Icon name="play" size={14} color="#FFFFFF" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderMusicCategory = () => (
        <>
            <View style={styles.quickGridContainer}>
                <View style={styles.gridRow}>
                    <TouchableOpacity style={styles.gridItem} onPress={() => handleQuickAction('Liked Songs')} activeOpacity={0.8}>
                        <View style={[styles.gridGradientBox, { backgroundColor: '#3A1C71' }]}>
                            <Icon name="heart" size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.gridItemText} numberOfLines={1}>Liked Songs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridItem} onPress={() => handleQuickAction('Heavy Rotation')} activeOpacity={0.8}>
                        <View style={[styles.gridGradientBox, { backgroundColor: '#11998e' }]}>
                            <Icon name="repeat" size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.gridItemText} numberOfLines={1}>Heavy Rotation</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.gridRow}>
                    <TouchableOpacity style={styles.gridItem} onPress={() => handleQuickAction('Your Podcasts')} activeOpacity={0.8}>
                        <View style={[styles.gridGradientBox, { backgroundColor: '#fc4a1a' }]}>
                            <Icon name="mic" size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.gridItemText} numberOfLines={1}>Podcasts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridItem} onPress={() => handleQuickAction('Local Files')} activeOpacity={0.8}>
                        <View style={[styles.gridGradientBox, { backgroundColor: '#ff007f' }]}>
                            <Icon name="folder-open" size={20} color="#FFFFFF" />
                        </View>
                        <Text style={styles.gridItemText} numberOfLines={1}>On Device</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.gridRow}>
                    <TouchableOpacity style={styles.gridItem} onPress={() => handleQuickAction('Devotional Mix')} activeOpacity={0.8}>
                        <View style={[styles.gridGradientBox, { backgroundColor: '#F2C94C' }]}>
                            <Icon name="sunny" size={20} color="#000000" />
                        </View>
                        <Text style={styles.gridItemText} numberOfLines={1}>Devotional</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.gridItem} onPress={() => handleQuickAction('Premium Releases')} activeOpacity={0.8}>
                        <View style={[styles.gridGradientBox, { backgroundColor: '#100C18' }]}>
                            <Icon name="trophy" size={18} color="#FFD700" />
                        </View>
                        <Text style={styles.gridItemText} numberOfLines={1}>Top Releases</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.heroBanner}
                activeOpacity={0.9}
                onPress={() => playPlaylist(allSongs)}
            >
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop' }}
                    style={styles.heroBannerImage}
                >
                    <View style={styles.heroOverlay}>
                        <View style={styles.heroBadge}>
                            <Icon name="flash" size={12} color="#1DB954" style={{ marginRight: 4 }} />
                            <Text style={styles.heroBadgeText}>TRENDING GLOBALLY</Text>
                        </View>
                        <Text style={styles.heroTitle}>Top Late Night Vibes</Text>
                        <Text style={styles.heroSubtitle}>Unwind your day with deep and rhythmic melodies.</Text>
                        <View style={styles.heroActionContainer}>
                            <View style={styles.heroPlayButton}>
                                <Icon name="play-sharp" size={16} color="#000000" />
                                <Text style={styles.heroPlayText}>Listen Now</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recently Played</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('RecentlyPlayed')} activeOpacity={0.7}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={recentPlayed}
                    renderItem={renderRecentItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Artists</Text>
                </View>
                <FlatList
                    data={artists}
                    renderItem={renderArtistItem}
                    keyExtractor={(item) => item.name}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                />
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Made For You</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    <TouchableOpacity style={styles.mixCard} activeOpacity={0.8} onPress={() => playPlaylist(allSongs)}>
                        <Image source={{ uri: MIXES_IMAGES[0] }} style={styles.mixImage} />
                        <Text style={styles.mixTitle}>Daily Mix 1</Text>
                        <Text style={styles.mixSubtitle}>Hip Hop and Lo-fi mixes curated for your day.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mixCard} activeOpacity={0.8} onPress={() => playPlaylist(allSongs)}>
                        <Image source={{ uri: MIXES_IMAGES[1] }} style={styles.mixImage} />
                        <Text style={styles.mixTitle}>Daily Mix 2</Text>
                        <Text style={styles.mixSubtitle}>Pop and energetic acoustic session.</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mixCard} activeOpacity={0.8} onPress={() => playPlaylist(allSongs)}>
                        <Image source={{ uri: MIXES_IMAGES[2] }} style={styles.mixImage} />
                        <Text style={styles.mixTitle}>Discover Weekly</Text>
                        <Text style={styles.mixSubtitle}>Brand new music picked just for you.</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Radio</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Radio')} activeOpacity={0.7}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {radioStations.length > 0 ? radioStations.map((station, index) => (
                        <TouchableOpacity
                            key={station.stationuuid}
                            style={styles.radioCard}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('Radio')}
                        >
                            {station.favicon ? (
                                <Image source={{ uri: station.favicon }} style={styles.radioImage} />
                            ) : (
                                <Image source={{ uri: RADIO_IMAGES[index % RADIO_IMAGES.length] }} style={styles.radioImage} />
                            )}
                            <Text style={styles.radioName} numberOfLines={1}>{station.name}</Text>
                            <Text style={styles.radioTag} numberOfLines={1}>
                                {station.tags ? station.tags.split(',')[0] : 'Music'}
                            </Text>
                        </TouchableOpacity>
                    )) : ['Synth Station', 'Chill Jazz', 'Indie Rock', 'Focus Beats'].map((station, index) => (
                        <TouchableOpacity
                            key={station}
                            style={styles.radioCard}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('Radio')}
                        >
                            <Image source={{ uri: RADIO_IMAGES[index % RADIO_IMAGES.length] }} style={styles.radioImage} />
                            <Text style={styles.radioName} numberOfLines={1}>{station}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    );

    const renderPodcastsCategory = () => (
        <>
            <TouchableOpacity style={styles.heroBanner} activeOpacity={0.9}>
                <ImageBackground source={{ uri: PODCAST_IMAGES[0] }} style={styles.heroBannerImage}>
                    <View style={styles.heroOverlay}>
                        <View style={styles.heroBadge}>
                            <Icon name="mic" size={12} color="#FF6B6B" style={{ marginRight: 4 }} />
                            <Text style={[styles.heroBadgeText, { color: '#FF6B6B' }]}>FEATURED PODCAST</Text>
                        </View>
                        <Text style={styles.heroTitle}>The Daily Beat</Text>
                        <Text style={styles.heroSubtitle}>Your daily dose of music news, interviews, and behind-the-scenes stories from the industry.</Text>
                        <View style={styles.heroActionContainer}>
                            <TouchableOpacity style={styles.heroPlayButton}>
                                <Icon name="add" size={16} color="#000000" />
                                <Text style={styles.heroPlayText}>Follow</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Trending Podcasts</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {PODCAST_IMAGES.map((img, index) => (
                        <TouchableOpacity key={index} style={styles.podcastCard} activeOpacity={0.8}>
                            <Image source={{ uri: img }} style={styles.podcastImage} />
                            <View style={styles.podcastInfo}>
                                <Text style={styles.podcastTitle}>{['Music Insider', 'Beat Makers', 'Studio Sessions', 'Vinyl Stories'][index]}</Text>
                                <Text style={styles.podcastSubtitle}>{['Deep dives into chart-toppers', 'Producers share their craft', 'Behind the recording glass', 'The history of vinyl records'][index]}</Text>
                            </View>
                            <View style={styles.podcastMeta}>
                                <Icon name="headset-outline" size={10} color="#666" />
                                <Text style={styles.podcastMetaText}>{[12400, 8900, 15600, 6700][index].toLocaleString()} plays</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Browse Categories</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {['Music', 'Comedy', 'Tech', 'True Crime', 'News', 'Sports'].map((cat, index) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.podcastCategoryCard, { backgroundColor: COLORS[index % COLORS.length] + '22', borderColor: COLORS[index % COLORS.length] + '44' }]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.podcastCategoryText, { color: COLORS[index % COLORS.length] }]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>New Episodes</Text>
                </View>
                {allSongs.slice(0, 5).map((song, index) => (
                    <TouchableOpacity key={song.id} style={styles.podcastEpisodeCard} activeOpacity={0.8} onPress={() => playSong(song)}>
                        <Image source={{ uri: song.artwork || 'https://picsum.photos/seed/song/200' }} style={styles.podcastEpisodeImage} />
                        <View style={styles.podcastEpisodeInfo}>
                            <Text style={styles.podcastEpisodeTitle} numberOfLines={1}>{song.title}</Text>
                            <Text style={styles.podcastEpisodeArtist} numberOfLines={1}>{song.artist}</Text>
                            <View style={styles.podcastEpisodeMeta}>
                                <Text style={styles.podcastEpisodeDuration}>{song.duration}</Text>
                                <Text style={styles.podcastEpisodeDot}>•</Text>
                                <Text style={styles.podcastEpisodeDuration}>Ep. {index + 1}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.podcastEpisodePlay} onPress={() => playSong(song)}>
                            <Icon name="play" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    const renderRadioCategory = () => (
        <>
            <View style={styles.radioHeroContainer}>
                <View style={styles.radioHeroInner}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name="radio" size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.radioHeroTitle}>Live Radio</Text>
                    <Text style={styles.radioHeroSubtitle}>{radioStations.length > 0 ? `${radioStations.length} stations available` : 'Stations loading...'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Stations</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {radioStations.length > 0 ? radioStations.map((station, index) => (
                        <TouchableOpacity
                            key={station.stationuuid}
                            style={styles.radioCard}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('Radio')}
                        >
                            {station.favicon ? (
                                <Image source={{ uri: station.favicon }} style={styles.radioImage} />
                            ) : (
                                <Image source={{ uri: RADIO_IMAGES[index % RADIO_IMAGES.length] }} style={styles.radioImage} />
                            )}
                            <Text style={styles.radioName} numberOfLines={1}>{station.name}</Text>
                            <Text style={styles.radioTag} numberOfLines={1}>
                                {station.tags ? station.tags.split(',')[0] : 'Music'}
                            </Text>
                        </TouchableOpacity>
                    )) : ['Synth Station', 'Chill Jazz', 'Indie Rock', 'Focus Beats'].map((station, index) => (
                        <TouchableOpacity
                            key={station}
                            style={styles.radioCard}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('Radio')}
                        >
                            <Image source={{ uri: RADIO_IMAGES[index % RADIO_IMAGES.length] }} style={styles.radioImage} />
                            <Text style={styles.radioName} numberOfLines={1}>{station}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>By Genre</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {['Pop', 'Rock', 'Jazz', 'Hip Hop', 'Electronic', 'Classical', 'Bollywood', 'Lofi'].map((genre, index) => (
                        <TouchableOpacity
                            key={genre}
                            style={[styles.radioGenreChip, { borderColor: COLORS[index % COLORS.length] }]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.radioGenreText, { color: COLORS[index % COLORS.length] }]}>{genre}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recently Played</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {recentPlayed.slice(0, 4).map((item) => (
                        <TouchableOpacity key={item.id} style={styles.recentCard} activeOpacity={0.8}>
                            <View style={styles.recentImageContainer}>
                                {item.artwork ? (
                                    <Image source={{ uri: item.artwork }} style={styles.recentArt} />
                                ) : (
                                    <View style={styles.fallbackArtContainer}>
                                        <Icon name="musical-notes-outline" size={30} color="#888888" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </>
    );

    const renderWorkoutCategory = () => (
        <>
            <TouchableOpacity style={styles.workoutHero} activeOpacity={0.9}>
                <ImageBackground source={{ uri: WORKOUT_IMAGES[0] }} style={{ width: '100%', height: '100%' }}>
                    <View style={styles.heroOverlay}>
                        <View style={styles.heroBadge}>
                            <Icon name="flash" size={12} color="#FF6B6B" style={{ marginRight: 4 }} />
                            <Text style={[styles.heroBadgeText, { color: '#FF6B6B' }]}>HIGH ENERGY</Text>
                        </View>
                        <Text style={styles.heroTitle}>Workout Mix</Text>
                        <Text style={styles.heroSubtitle}>High-energy tracks to fuel your workout and push your limits.</Text>
                        <View style={styles.heroActionContainer}>
                            <TouchableOpacity style={styles.heroPlayButton} onPress={() => playPlaylist(workoutSongs)}>
                                <Icon name="play-sharp" size={16} color="#000000" />
                                <Text style={styles.heroPlayText}>Start Workout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Workout Playlists</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {WORKOUT_IMAGES.map((img, index) => (
                        <TouchableOpacity key={index} style={styles.workoutCard} activeOpacity={0.8} onPress={() => playPlaylist(workoutSongs)}>
                            <Image source={{ uri: img }} style={styles.workoutImage} />
                            <Text style={styles.workoutCardTitle}>{['Warm Up', 'Cardio Blast', 'Strength', 'Cool Down'][index]}</Text>
                            <Text style={styles.workoutCardSub}>{['Light beats to get started', 'High BPM cardio tracks', 'Heavy lifting anthems', 'Stretch and recover'][index]}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Workout Tracks</Text>
                </View>
                {workoutSongs.map((song, index) => renderSongItem(song, index, '#FF6B6B'))}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Workout Timer</Text>
                </View>
                <View style={styles.timerCard}>
                    <Text style={styles.timerTitle}>Set Your Timer</Text>
                    <View style={styles.timerRow}>
                        {['15 min', '30 min', '45 min', '60 min'].map((time) => (
                            <TouchableOpacity key={time} style={styles.timerChip} activeOpacity={0.8}>
                                <Text style={styles.timerChipText}>{time}</Text>
                                <Text style={styles.timerChipLabel}>duration</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </>
    );

    const renderFocusCategory = () => (
        <>
            <TouchableOpacity style={styles.focusHero} activeOpacity={0.9}>
                <ImageBackground source={{ uri: FOCUS_IMAGES[0] }} style={{ width: '100%', height: '100%' }}>
                    <View style={styles.heroOverlay}>
                        <View style={styles.heroBadge}>
                            <Icon name="leaf" size={12} color="#4ECDC4" style={{ marginRight: 4 }} />
                            <Text style={[styles.heroBadgeText, { color: '#4ECDC4' }]}>ZEN MODE</Text>
                        </View>
                        <Text style={styles.heroTitle}>Deep Focus</Text>
                        <Text style={styles.heroSubtitle}>Ambient and lofi sounds to help you concentrate and find your flow.</Text>
                        <View style={styles.heroActionContainer}>
                            <TouchableOpacity style={styles.heroPlayButton} onPress={() => playPlaylist(focusSongs)}>
                                <Icon name="play-sharp" size={16} color="#000000" />
                                <Text style={styles.heroPlayText}>Start Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Focus Playlists</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                    {FOCUS_IMAGES.map((img, index) => (
                        <TouchableOpacity key={index} style={styles.focusCard} activeOpacity={0.8} onPress={() => playPlaylist(focusSongs)}>
                            <Image source={{ uri: img }} style={styles.focusImage} />
                            <Text style={styles.focusCardTitle}>{['Deep Work', 'Study Session', 'Meditation', 'Sleep'][index]}</Text>
                            <Text style={styles.focusCardSub}>{['Zero distractions', 'Concentration boost', 'Mindfulness sounds', 'Drift off gently'][index]}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Focus Tracks</Text>
                </View>
                {focusSongs.map((song, index) => renderSongItem(song, index, '#4ECDC4'))}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Focus Timer</Text>
                </View>
                <View style={styles.timerCard}>
                    <Text style={styles.timerTitle}>Pomodoro Timer</Text>
                    <View style={styles.timerRow}>
                        {['15 min', '30 min', '45 min', '60 min'].map((time) => (
                            <TouchableOpacity key={time} style={styles.timerChip} activeOpacity={0.8}>
                                <Text style={styles.timerChipText}>{time}</Text>
                                <Text style={styles.timerChipLabel}>focus</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greeting}>Good evening</Text>
                    <Text style={styles.username}>{userName}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Search')}>
                        <Icon name="search-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerIconButton}
                        onPress={() => navigation.navigate('Notification')}
                    >
                        <Icon name="notifications-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                    {CATEGORIES.map((category) => {
                        const isSelected = activeCategory === category.title;
                        return (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                                onPress={() => setActiveCategory(category.title)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                                    {category.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeCategory === 'Music' && renderMusicCategory()}
                {activeCategory === 'Podcasts' && renderPodcastsCategory()}
                {activeCategory === 'Radio' && renderRadioCategory()}
                {activeCategory === 'Workout' && renderWorkoutCategory()}
                {activeCategory === 'Focus Mood' && renderFocusCategory()}

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A' },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 20 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerLeft: { flex: 1 },
    greeting: { color: '#888888', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    username: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 4 },
    headerRight: { flexDirection: 'row', gap: 10 },
    headerIconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#151515',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },

    categoriesContainer: { marginVertical: 12 },
    categoriesList: { paddingHorizontal: 20, gap: 8 },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#151515',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    categoryPillActive: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
    categoryText: { color: '#A7A7A7', fontSize: 13, fontWeight: '600' },
    categoryTextActive: { color: '#000000', fontWeight: '700' },

    quickGridContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 10,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    gridItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        height: 56,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    gridGradientBox: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridItemText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        paddingHorizontal: 12,
        flex: 1,
    },

    heroBanner: {
        height: 190,
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 12,
    },
    heroBannerImage: { width: '100%', height: '100%' },
    heroOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        padding: 18,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    heroBadgeText: { color: '#1DB954', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
    heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
    heroSubtitle: { color: '#D0D0D0', fontSize: 12, marginTop: 4, marginBottom: 14, fontWeight: '400' },
    heroActionContainer: { flexDirection: 'row' },
    heroPlayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
    },
    heroPlayText: { color: '#000000', fontSize: 12, fontWeight: '700', marginLeft: 6 },

    section: { marginTop: 26 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', letterSpacing: -0.2 },
    notextfound: { color: colors.grey, fontSize: 16, fontWeight: '500', textAlign: 'center', marginTop: 20 },
    seeAll: { color: colors.green, fontSize: 13, fontWeight: '700' },
    horizontalList: { paddingLeft: 20, paddingRight: 8 },

    recentCard: { width: 110, marginRight: 14 },
    recentImageContainer: {
        width: 110,
        height: 110,
        borderRadius: 10,
        backgroundColor: '#151515',
        overflow: 'hidden',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    recentArt: { width: '100%', height: '100%', resizeMode: 'cover' },
    fallbackArtContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    recentTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 2 },
    recentArtist: { color: '#888888', fontSize: 11, marginTop: 1 },

    // Playlist Cards
    playlistCard: {
        width: 160,
        marginRight: 16
    },
    playlistImage: {
        width: 160,
        height: 160,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#2C2C2C',
    },
    playlistImageText: { fontSize: 50 },
    playlistTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    playlistSongs: { color: '#B3B3B3', fontSize: 12, marginTop: 2 },

    // Mood Cards
    moodCardWrapper: {
        width: 140,
        marginRight: 12,
    },
    moodCard: {
        height: 120,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    moodEmojiContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    moodEmoji: { fontSize: 24 },
    moodTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    moodSongCount: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
    },
    moodSongCountText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },

    // Made For You Cards
    mixCard: { width: 160, marginRight: 16 },
    mixImage: { width: 160, height: 160, borderRadius: 12, marginBottom: 8 },
    mixTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    mixSubtitle: { color: '#888888', fontSize: 11, marginTop: 2, lineHeight: 15 },

    radioCard: { width: 96, marginRight: 16, alignItems: 'center', position: 'relative' },
    radioImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    radioIndicator: {
        position: 'absolute',
        top: 6,
        right: 12,
        backgroundColor: '#FF0055',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    liveDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF', marginRight: 3 },
    liveText: { color: '#FFFFFF', fontSize: 7, fontWeight: '800' },
    radioName: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
    radioTag: { color: '#1DB954', fontSize: 9, fontWeight: '600', marginTop: 2, textAlign: 'center' },

    // Top Artists Cards
    artistCard: {
        width: 100,
        marginRight: 16,
        alignItems: 'center'
    },
    artistImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#151515',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    artistImagePhoto: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    artistFallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    artistImageText: { fontSize: 32 },
    artistName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
    artistLabel: { color: '#888888', fontSize: 12, marginTop: 2 },

    // Song Row
    songRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8,
    },
    songRowImage: {
        width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#222',
    },
    songRowInfo: { flex: 1 },
    songRowTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    songRowArtist: { color: '#888', fontSize: 12, marginTop: 2 },
    songRowPlay: {
        width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    },

    // Podcast styles
    podcastCard: {
        width: 200, marginRight: 14, backgroundColor: '#151515', borderRadius: 12, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    },
    podcastImage: { width: 200, height: 110, resizeMode: 'cover' },
    podcastInfo: { padding: 10 },
    podcastTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    podcastSubtitle: { color: '#888', fontSize: 11, marginTop: 2 },
    podcastMeta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 10, gap: 4 },
    podcastMetaText: { color: '#666', fontSize: 10 },
    podcastCategoryCard: {
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10,
    },
    podcastCategoryText: { fontSize: 13, fontWeight: '700' },
    podcastEpisodeCard: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10,
    },
    podcastEpisodeImage: { width: 56, height: 56, borderRadius: 8, marginRight: 12, backgroundColor: '#222' },
    podcastEpisodeInfo: { flex: 1 },
    podcastEpisodeTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    podcastEpisodeArtist: { color: '#888', fontSize: 12, marginTop: 2 },
    podcastEpisodeMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    podcastEpisodeDuration: { color: '#666', fontSize: 11 },
    podcastEpisodeDot: { color: '#666', fontSize: 11 },
    podcastEpisodePlay: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#1DB954',
        justifyContent: 'center', alignItems: 'center',
    },

    // Radio hero
    radioHeroContainer: {
        marginHorizontal: 20, marginTop: 8, marginBottom: 12,
        backgroundColor: '#151515', borderRadius: 16, padding: 24,
        borderWidth: 1, borderColor: 'rgba(29,185,84,0.2)',
    },
    radioHeroInner: { alignItems: 'center' },
    radioHeroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginTop: 12 },
    radioHeroSubtitle: { color: '#888', fontSize: 13, marginTop: 4 },
    radioGenreChip: {
        paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, marginRight: 10,
        borderWidth: 1.5, backgroundColor: 'transparent',
    },
    radioGenreText: { fontSize: 13, fontWeight: '700' },

    // Workout styles
    workoutHero: { height: 190, marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginTop: 8, marginBottom: 12 },
    workoutCard: { width: 140, marginRight: 14 },
    workoutImage: { width: 140, height: 100, borderRadius: 12, marginBottom: 6 },
    workoutCardTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    workoutCardSub: { color: '#888', fontSize: 10, marginTop: 2 },

    // Focus styles
    focusHero: { height: 190, marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', marginTop: 8, marginBottom: 12 },
    focusCard: { width: 140, marginRight: 14 },
    focusImage: { width: 140, height: 100, borderRadius: 12, marginBottom: 6 },
    focusCardTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    focusCardSub: { color: '#888', fontSize: 10, marginTop: 2 },
    timerCard: {
        marginHorizontal: 20, backgroundColor: '#151515', borderRadius: 16, padding: 20,
        borderWidth: 1, borderColor: 'rgba(78,205,196,0.2)',
    },
    timerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
    timerRow: { flexDirection: 'row', gap: 10 },
    timerChip: {
        flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#1A1A2E',
        alignItems: 'center', borderWidth: 1, borderColor: 'rgba(78,205,196,0.2)',
    },
    timerChipText: { color: '#4ECDC4', fontSize: 13, fontWeight: '700' },
    timerChipLabel: { color: '#666', fontSize: 10, marginTop: 2 },
});

export default HomeScreen;