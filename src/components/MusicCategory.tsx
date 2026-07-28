// src/components/home/MusicCategory.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import TrackPlayer, { usePlaybackState, State, useActiveTrack } from 'react-native-track-player';

import CategoryHeader from './CategoryHeader';
import HeroBanner from './HeroBanner';
import { getAllSongs, getSongByName, getUniqueArtists, getUniqueMoods, Song } from '../data/songs';
import { RecentSong } from '../utils/recentlyPlayed';
import { searchSongsByName } from '../services/jiosaavn';

// Constants
const MOOD_EMOJI: { [key: string]: string } = {
    'Defiant': '🔥',
    'Melancholy': '🌧️',
    'Chill': '😎',
    'Energizing': '⚡',
    'Romantic': '❤️',
    'Peaceful': '🌸',
    'Sad': '😢',
    'Fun': '🎉',
    'Focused': '🎯',
    'Rowdy': '🤘',
    'Uplifting': '🌟',
    'Happy': '😊',
    'Unknown': '🎵',
};

const MOOD_COLORS: { [key: string]: string } = {
    'Chill': '#1DB954',
    'Energizing': '#1DB954',
    'Peaceful': '#1DB954',
    'Uplifting': '#1DB954',
    'Happy': '#1DB954',
    'Rowdy': '#1DB954',
    'Defiant': '#1DB954',
    'Romantic': '#1DB954',
    'Focused': '#1DB954',
    'Fun': '#1DB954',
    'Melancholy': '#1DB954',
    'Unknown': '#1DB954',
};

const MOOD_IMAGES: { [key: string]: string } = {
    'Chill': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop',
    'Energizing': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
    'Peaceful': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop',
    'Uplifting': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400&auto=format&fit=crop',
    'Happy': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
    'Rowdy': 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop',
    'Defiant': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop',
    'Romantic': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop',
    'Focused': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop',
    'Fun': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop',
    'Melancholy': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
    'Unknown': 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=400&auto=format&fit=crop',
};

const RADIO_IMAGES = [
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=200&auto=format&fit=crop',
];

interface MusicCategoryProps {
    onPlaySong: (song: Song) => void;
    onPlayPlaylist: (tracks: Song[]) => void;
    miniPlayerHeight?: number;
    navigation?: any;
}

const MusicCategory: React.FC<MusicCategoryProps> = ({
    onPlaySong,
    onPlayPlaylist,
    miniPlayerHeight = 0,
    navigation
}) => {
    const nav: any = navigation || useNavigation();
    const activeTrack = useActiveTrack();
    const playbackState = usePlaybackState();
    const [recentPlayedSongs, setRecentPlayedSongs] = useState<RecentSong[]>([]);
    const [artistImages, setArtistImages] = useState<{ [key: string]: string }>({});
    const [moodApiSongs, setMoodApiSongs] = useState<{ [mood: string]: Song[] }>({});
    const [moodLoading, setMoodLoading] = useState(false);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const allSongs = getAllSongs();
    const artists = getUniqueArtists();
    const moods = getUniqueMoods();

    useEffect(() => {
        const images: { [key: string]: string } = {};
        artists.forEach(artist => {
            const song = allSongs.find(s => s.artist === artist.name && s.artwork);
            if (song) images[artist.name] = song.artwork!;
        });
        setArtistImages(images);
    }, [artists, allSongs]);

    useEffect(() => {
        const fetchAllMoodSongs = async () => {
            const moodNames = moods.map(m => m.name);
            const results: { [mood: string]: Song[] } = {};
            const batches = [];
            for (let i = 0; i < moodNames.length; i += 3) {
                batches.push(moodNames.slice(i, i + 3));
            }
            for (const batch of batches) {
                const batchResults = await Promise.allSettled(
                    batch.map(async (mood) => {
                        const songs = await searchSongsByName(mood, 15);
                        return { mood, songs };
                    })
                );
                batchResults.forEach(result => {
                    if (result.status === 'fulfilled' && result.value.songs.length > 0) {
                        results[result.value.mood] = result.value.songs;
                    }
                });
            }
            setMoodApiSongs(results);
        };
        fetchAllMoodSongs();
    }, []);

    const handleMoodPress = async (mood: string) => {
        const color = MOOD_COLORS[mood] || '#1DB954';
        const cachedSongs = moodApiSongs[mood];
        if (cachedSongs && cachedSongs.length > 0) {
            nav.navigate('MoodDetail', { moodName: mood, moodColor: color, songs: cachedSongs });
        } else {
            try {
                setMoodLoading(true);
                setSelectedMood(mood);
                const songs = await searchSongsByName(mood, 20);
                setMoodApiSongs(prev => ({ ...prev, [mood]: songs }));
                nav.navigate('MoodDetail', { moodName: mood, moodColor: color, songs });
            } catch {
                const localSongs = allSongs.filter(s => (s.mood || 'Chill') === mood);
                nav.navigate('MoodDetail', { moodName: mood, moodColor: color, songs: localSongs });
            } finally {
                setMoodLoading(false);
                setSelectedMood(null);
            }
        }
    };

    const renderRecentItem = ({ item }: { item: any }) => {
        const isActive = activeTrack?.url === item.url;
        const isPlaying = isActive && playbackState.state === State.Playing;
        return (
            <TouchableOpacity
                style={[styles.recentCard, isActive && { opacity: 1 }]}
                activeOpacity={0.8}
                onPress={() => onPlaySong(getSongByName(item.songRef) || item)}
            >
                <View style={[styles.recentImageContainer, isActive && { borderWidth: 2, borderColor: '#1DB954' }]}>
                    {item.artwork ? (
                        <Image source={{ uri: item.artwork }} style={styles.recentArt} />
                    ) : (
                        <View style={styles.fallbackArtContainer}>
                            <Icon name="musical-notes-outline" size={30} color="#888888" />
                        </View>
                    )}
                    <View style={styles.recentPlayOverlay}>
                        <View style={[styles.recentPlayBtn, isActive && { backgroundColor: '#1DB954' }]}>
                            <Icon name={isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" />
                        </View>
                    </View>
                </View>
                <Text style={[styles.recentTitle, isActive && { color: '#1DB954' }]} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
            </TouchableOpacity>
        );
    };

    const renderArtistItem = ({ item }: { item: any }) => {
        const imageUrl = artistImages[item.name];
        return (
            <TouchableOpacity
                style={styles.artistCard}
                activeOpacity={0.8}
                onPress={() => nav.navigate('ArtistDetail', { artist: item.name })}
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
                <Text style={styles.artistName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <HeroBanner
                imageUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop"
                badgeText="TRENDING GLOBALLY"
                title="Top Late Night Vibes"
                subtitle="Unwind your day with deep and rhythmic melodies."
                buttonText="Listen Now"
                onPress={() => onPlayPlaylist(allSongs)}
            />

            <CategoryHeader
                title="Recently Played"
                onSeeAll={() => nav.navigate('RecentlyPlayed')}
            />
            <FlatList
                data={allSongs.slice(0, 10)}
                renderItem={renderRecentItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
            />

            <CategoryHeader title="Top Artists" showSeeAll={false} />
            <FlatList
                data={artists}
                renderItem={renderArtistItem}
                keyExtractor={(item) => item.name}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
            />

            <CategoryHeader
                title="Mood Based"
                onSeeAll={() => {
                    const allMoodSongs: Song[] = [];
                    Object.values(moodApiSongs).forEach(songs => allMoodSongs.push(...songs));
                    if (allMoodSongs.length === 0) {
                        moods.forEach((mood) => {
                            const localSongs = allSongs.filter(s => (s.mood || 'Chill') === mood.name);
                            allMoodSongs.push(...localSongs);
                        });
                    }
                    nav.navigate('MoodDetail', {
                        moodName: 'All Moods',
                        moodColor: '#1DB954',
                        songs: allMoodSongs,
                    });
                }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScrollContent}>
                {moods.map((mood) => {
                    const emoji = MOOD_EMOJI[mood.name] || '🎵';
                    const color = MOOD_COLORS[mood.name] || '#1DB954';
                    const apiCount = moodApiSongs[mood.name]?.length;
                    const img = MOOD_IMAGES[mood.name];
                    return (
                        <TouchableOpacity
                            key={mood.name}
                            style={styles.moodTile}
                            activeOpacity={0.85}
                            onPress={() => handleMoodPress(mood.name)}
                        >
                            <Image source={{ uri: img }} style={styles.moodTileImage} />
                            <View style={[styles.moodTileOverlay, { backgroundColor: color + 'AA' }]} />
                            <Text style={styles.moodTileEmoji}>{emoji}</Text>
                            <View style={styles.moodTileBottom}>
                                <Text style={styles.moodTileName}>{mood.name}</Text>
                                <Text style={styles.moodTileCount}>{apiCount || mood.songCount} songs</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {selectedMood && moodLoading && (
                <View style={styles.section}>
                    <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                        <Icon name="hourglass-outline" size={24} color="#888" />
                        <Text style={{ color: '#888', marginTop: 8, fontSize: 13 }}>Loading {selectedMood} songs...</Text>
                    </View>
                </View>
            )}

            <CategoryHeader title="Radio" onSeeAll={() => nav.navigate('Radio')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {['Synth Station', 'Chill Jazz', 'Indie Rock', 'Focus Beats'].map((station, index) => (
                    <TouchableOpacity
                        key={station}
                        style={styles.radioCard}
                        activeOpacity={0.85}
                        onPress={() => nav.navigate('Radio')}
                    >
                        <Image source={{ uri: RADIO_IMAGES[index % RADIO_IMAGES.length] }} style={styles.radioImage} />
                        <Text style={styles.radioName} numberOfLines={1}>{station}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    horizontalList: {
        paddingLeft: 20,
        paddingRight: 8,
    },
    section: {
        marginTop: 26,
    },
    recentCard: {
        width: 110,
        marginRight: 14,
    },
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
    recentArt: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    fallbackArtContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentPlayOverlay: {
        position: 'absolute',
        bottom: 6,
        right: 6,
    },
    recentPlayBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    recentTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    recentArtist: {
        color: '#888888',
        fontSize: 11,
        marginTop: 1,
    },
    artistCard: {
        width: 100,
        marginRight: 16,
        alignItems: 'center',
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
    artistImageText: {
        fontSize: 32,
    },
    artistName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    moodScrollContent: {
        paddingLeft: 20,
        paddingRight: 8,
        gap: 12,
    },
    moodTile: {
        width: 150,
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    moodTileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    moodTileOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    moodTileEmoji: {
        position: 'absolute',
        top: 12,
        right: 12,
        fontSize: 48,
        transform: [{ rotate: '15deg' }],
        opacity: 0.95,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    moodTileBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
        paddingBottom: 14,
    },
    moodTileName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    moodTileCount: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    radioCard: {
        width: 96,
        marginRight: 16,
        alignItems: 'center',
    },
    radioImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    radioName: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default MusicCategory;