import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Alert,
    ActivityIndicator,
    Image,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { usePlaybackState, State, useActiveTrack } from 'react-native-track-player';
import { searchSongsByName, searchAll, getArtistDetails, getArtistSongs } from '../../services/jiosaavn';
import { getSongsByArtist, parseDuration, songToTrack } from '../../data/songs';
import type { Song } from '../../data/songs';

// Equalizer Component
const Equalizer = ({ isActive, isPlaying }: { isActive: boolean; isPlaying: boolean }) => {
    const barHeights = useRef([
        new Animated.Value(8),
        new Animated.Value(16),
        new Animated.Value(10),
        new Animated.Value(20),
        new Animated.Value(12),
        new Animated.Value(14),
        new Animated.Value(9),
        new Animated.Value(18),
        new Animated.Value(11),
        new Animated.Value(22),
    ]).current;

    useEffect(() => {
        let animations: Animated.CompositeAnimation[] = [];

        if (isActive && isPlaying) {
            animations = barHeights.map((bar) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(bar, {
                            toValue: Math.random() * 24 + 8,
                            duration: 300 + Math.random() * 300,
                            useNativeDriver: false,
                        }),
                        Animated.timing(bar, {
                            toValue: Math.random() * 24 + 8,
                            duration: 300 + Math.random() * 300,
                            useNativeDriver: false,
                        }),
                        Animated.timing(bar, {
                            toValue: Math.random() * 24 + 8,
                            duration: 300 + Math.random() * 300,
                            useNativeDriver: false,
                        }),
                    ])
                );
            });

            animations.forEach(anim => anim.start());
        } else {
            barHeights.forEach((bar) => {
                Animated.timing(bar, {
                    toValue: 8,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            });
        }

        return () => {
            animations.forEach(anim => anim.stop());
        };
    }, [isActive, isPlaying]);

    return (
        <View style={styles.equalizerContainer}>
            <Animated.View style={[styles.equalizerBar, { height: barHeights[0] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[1] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[2] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[3] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[4] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[5] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[6] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[7] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[8] }]} />
            <Animated.View style={[styles.equalizerBar, { height: barHeights[9] }]} />
        </View>
    );
};

const ArtistDetailScreen = ({ navigation, route }: any) => {
    const { artist } = route?.params || {};
    const [songs, setSongs] = useState<Song[]>([]);
    const [artistPicture, setArtistPicture] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;

    useEffect(() => {
        fetchArtistData();
    }, [artist]);

    const fetchArtistData = async () => {
        try {
            setLoading(true);
            setError(null);

            let results: Song[] = [];
            let artistId: string | null = null;
            let artistImage: string | null = null;

            // Step 1: Search for the artist to get their ID
            try {
                const searchResult = await searchAll(artist || '');
                const matchedArtist = searchResult.artists?.find(
                    (a: any) => a.name?.toLowerCase() === (artist || '').toLowerCase()
                ) || searchResult.artists?.[0];
                if (matchedArtist) {
                    artistId = matchedArtist.id;
                    artistImage = matchedArtist.image;
                }
            } catch { /* ignore */ }

            // Step 2: Get artist details and songs using the ID
            if (artistId) {
                try {
                    const details = await getArtistDetails(artistId);
                    if (details) {
                        if (details.image) artistImage = details.image;
                        if (details.topSongs?.length > 0) results = details.topSongs;
                    }
                } catch { /* ignore */ }

                if (results.length === 0) {
                    try {
                        results = await getArtistSongs(artistId);
                    } catch { /* ignore */ }
                }
            }

            // Step 3: Fallback to name search
            if (results.length === 0) {
                try {
                    results = await searchSongsByName(artist || '', 25);
                } catch { /* ignore */ }
            }

            // Step 4: Final fallback to local data
            if (results.length === 0) {
                results = getSongsByArtist(artist || '');
            }

            if (artistImage) setArtistPicture(artistImage);
            if (results.length > 0) {
                setSongs(results);
                if (!artistImage && results[0].artwork) setArtistPicture(results[0].artwork);
            } else {
                setError('No songs found for this artist.');
            }
        } catch (err) {
            console.log('API fetch error:', err);
            setError('Failed to load songs. Check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const playSong = async (song: Song) => {
        try {
            if (activeTrack?.id === song.id) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
                return;
            }

            const track = songToTrack(song);

            await TrackPlayer.reset();
            await TrackPlayer.add(track);
            await TrackPlayer.play();
        } catch (error: any) {
            if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                try {
                    await TrackPlayer.reset();
                    await TrackPlayer.add(songToTrack(song));
                    await TrackPlayer.play();
                } catch (innerError) {
                    console.log('Playback retry error:', innerError);
                }
            } else {
                console.log('Playback error:', error);
            }
        }
    };

    const playAll = async () => {
        try {
            if (songs.length === 0) {
                Alert.alert('No Songs', 'No songs found.');
                return;
            }

            if (activeTrack && isPlaying) {
                await TrackPlayer.pause();
                return;
            }

            const tracks = songs.map((s) => songToTrack(s));

            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
        } catch (error: any) {
            if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                try {
                    await TrackPlayer.reset();
                    await TrackPlayer.add(songs.map((s) => songToTrack(s)));
                    await TrackPlayer.play();
                } catch (innerError) {
                    console.log('Play all retry error:', innerError);
                }
            } else {
                console.log('Play all error:', error);
            }
        }
    };

    const shufflePlay = async () => {
        try {
            if (songs.length === 0) {
                Alert.alert('No Songs', 'No songs found.');
                return;
            }

            const shuffled = [...songs].sort(() => Math.random() - 0.5);
            const tracks = shuffled.map((s) => songToTrack(s));

            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
        } catch (error: any) {
            if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                try {
                    const shuffled = [...songs].sort(() => Math.random() - 0.5);
                    await TrackPlayer.reset();
                    await TrackPlayer.add(shuffled.map((s) => songToTrack(s)));
                    await TrackPlayer.play();
                } catch (innerError) {
                    console.log('Shuffle retry error:', innerError);
                }
            } else {
                console.log('Shuffle error:', error);
            }
        }
    };

    const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
        const isActive = activeTrack?.id === item.id;
        const playlistData = songs.map((s) => ({
            title: s.title,
            artist: s.artist,
            artwork: s.artwork || 'https://picsum.photos/seed/song/400',
            duration: s.duration,
            likes: s.play_count || 0,
            album: s.album,
            genre: s.genre || '',
            url: s.url,
        }));

        return (
            <TouchableOpacity
                style={styles.songItem}
                onPress={() => {
                    navigation.navigate('SongDetail', {
                        song: {
                            title: item.title,
                            artist: item.artist,
                            artwork: item.artwork || 'https://picsum.photos/seed/song/400',
                            duration: item.duration,
                            likes: item.play_count || 0,
                            album: item.album,
                            genre: item.genre || '',
                            url: item.url,
                        },
                        playlist: playlistData,
                        currentIndex: index,
                    });
                }}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: item.artwork || 'https://picsum.photos/seed/song/200' }}
                    style={styles.songCover}
                />
                <View style={styles.songInfo}>
                    <View style={styles.songTitleRow}>
                        <Text style={[styles.songTitle, isActive && styles.songTitleActive]} numberOfLines={1}>
                            {item.title}
                        </Text>
                    </View>
                    <View style={styles.songMetaRow}>
                        <Text style={styles.songAlbum} numberOfLines={1}>
                            {item.album}
                        </Text>
                    </View>
                </View>
                <View style={styles.songRight}>
                    {isActive && isPlaying && <Equalizer isActive={isActive} isPlaying={isPlaying} />}
                    <Text style={styles.songDuration}>{item.duration}</Text>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => playSong(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {isActive && isPlaying ? (
                            <Icon name="pause-circle" size={32} color="#1DB954" />
                        ) : (
                            <Icon name="play-circle" size={32} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Icon name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Artist</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={styles.loadingText}>Loading songs...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                        <Icon name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Artist</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <Icon name="musical-notes-outline" size={48} color="#333" />
                    <Text style={styles.emptyTitle}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchArtistData}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Icon name="chevron-back" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Artist</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.artistInfoContainer}>
                    {artistPicture ? (
                        <Image source={{ uri: artistPicture }} style={styles.artistImage} />
                    ) : (
                        <View style={styles.artistImageContainer}>
                            <Icon name="person" size={70} color="#1DB954" />
                        </View>
                    )}

                    <Text style={styles.artistName}>{artist}</Text>

                    <Text style={styles.artistListeners}>
                        {songs.length} tracks found
                    </Text>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.shuffleButton} onPress={shufflePlay}>
                            <Icon name="shuffle" size={20} color="#FFFFFF" />
                            <Text style={styles.shuffleText}>Shuffle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.playAllButton} onPress={playAll}>
                            <Icon name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
                            <Text style={styles.playAllText}>
                                {isPlaying ? 'Pause' : 'Play All'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Songs
                            <Text style={styles.songCount}>
                                {' '}({songs.length})
                            </Text>
                        </Text>
                    </View>

                    {songs.length > 0 ? (
                        <FlatList
                            data={songs}
                            renderItem={renderSongItem}
                            keyExtractor={(item) => String(item.id)}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="musical-notes-outline" size={48} color="#333" />
                            <Text style={styles.emptyTitle}>No songs found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#B3B3B3',
        fontSize: 14,
        marginTop: 12,
    },
    retryButton: {
        backgroundColor: '#1DB954',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 16,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    artistInfoContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    artistImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#1DB954',
    },
    artistImageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#1DB954',
    },
    artistName: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    artistListeners: {
        color: '#B3B3B3',
        fontSize: 14,
        marginBottom: 16,
    },
    fetchingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(29,185,84,0.1)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
        gap: 8,
    },
    fetchingText: {
        color: '#1DB954',
        fontSize: 13,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    shuffleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
    },
    shuffleText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    playAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1DB954',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    playAllText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    songCount: {
        fontSize: 14,
        fontWeight: '400',
        color: '#1DB954',
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    songCover: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
    },
    songInfo: {
        flex: 1,
    },
    songTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    songTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    songTitleActive: {
        color: '#1DB954',
    },
    songMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    songAlbum: {
        color: '#B3B3B3',
        fontSize: 12,
    },
    previewBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    previewBadgeText: {
        color: '#1DB954',
        fontSize: 9,
        fontWeight: '700',
    },
    songRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    songDuration: {
        color: '#B3B3B3',
        fontSize: 13,
    },
    playButton: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 4,
    },
    equalizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2.5,
        height: 20,
        width: 20,
        marginRight: 50,
    },
    equalizerBar: {
        width: 3,
        backgroundColor: '#1DB954',
        borderRadius: 2,
    },
});

export default ArtistDetailScreen;