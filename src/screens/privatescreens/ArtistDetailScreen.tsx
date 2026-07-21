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

interface ApiSong {
    id: number;
    title: string;
    duration: number;
    preview: string;
    artist: { id: number; name: string; picture_medium: string };
    album: { id: number; title: string; cover_medium: string };
    fullUrl?: string;
}

interface ArtistData {
    id: number;
    name: string;
    picture_big: string;
    nb_album: number;
    nb_fan: number;
}

const AUDIUS_DISCOVERY = 'https://discovery.audius.co/api/v1';

const searchAudius = async (title: string, artist: string): Promise<{ url: string; duration: number } | null> => {
    const queries = [
        `${title} ${artist}`,
        title,
    ];

    for (const query of queries) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(
                `${AUDIUS_DISCOVERY}/tracks/search?query=${encodeURIComponent(query)}&app_name=MusicApp&limit=5`,
                { signal: controller.signal }
            );
            clearTimeout(timeout);
            const data = await res.json();

            if (data.data && data.data.length > 0) {
                const track = data.data[0];
                const streamUrl = `${AUDIUS_DISCOVERY}/tracks/${track.id}/stream?app_name=MusicApp`;
                return { url: streamUrl, duration: track.duration || 0 };
            }
        } catch {
            continue;
        }
    }
    return null;
};

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
    const [songs, setSongs] = useState<ApiSong[]>([]);
    const [artistData, setArtistData] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchingFull, setFetchingFull] = useState(false);
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

            const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(artist || '')}`;
            const response = await fetch(searchUrl);
            const json = await response.json();

            if (json.data && json.data.length > 0) {
                const deezerSongs = json.data.slice(0, 25);
                setSongs(deezerSongs);

                const firstTrack = json.data[0];
                setArtistData({
                    id: firstTrack.artist.id,
                    name: firstTrack.artist.name,
                    picture_big: firstTrack.artist.picture_medium,
                    nb_album: 0,
                    nb_fan: 0,
                });

                fetchFullTracks(deezerSongs);
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

    const fetchFullTracks = async (deezerSongs: ApiSong[]) => {
        setFetchingFull(true);
        const updated = [...deezerSongs];

        const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

        for (let i = 0; i < deezerSongs.length; i++) {
            const song = deezerSongs[i];
            const result = await searchAudius(song.title, song.artist.name);
            if (result) {
                updated[i] = { ...updated[i], fullUrl: result.url };
            }
            if (i < deezerSongs.length - 1) {
                await delay(200);
            }
        }

        setSongs([...updated]);
        setFetchingFull(false);
    };

    const getAudioUrl = (song: ApiSong): string => {
        return song.fullUrl || song.preview;
    };

    const playSong = async (song: ApiSong) => {
        try {
            if (activeTrack?.id === String(song.id)) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
                return;
            }

            const track = {
                id: String(song.id),
                url: getAudioUrl(song),
                title: song.title,
                artist: song.artist.name,
                album: song.album.title || 'Unknown',
                duration: song.duration,
                artwork: song.album.cover_medium || song.artist.picture_medium,
            };

            await TrackPlayer.reset();
            await TrackPlayer.add(track);
            await TrackPlayer.play();
        } catch (error: any) {
            if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                try {
                    await TrackPlayer.reset();
                    await TrackPlayer.add({
                        id: String(song.id),
                        url: getAudioUrl(song),
                        title: song.title,
                        artist: song.artist.name,
                        album: song.album.title || 'Unknown',
                        duration: song.duration,
                        artwork: song.album.cover_medium || song.artist.picture_medium,
                    });
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

            const tracks = songs.map((song) => ({
                id: String(song.id),
                url: getAudioUrl(song),
                title: song.title,
                artist: song.artist.name,
                album: song.album.title || 'Unknown',
                duration: song.duration,
                artwork: song.album.cover_medium || song.artist.picture_medium,
            }));

            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
        } catch (error: any) {
            if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                try {
                    await TrackPlayer.reset();
                    const tracks = songs.map((song) => ({
                        id: String(song.id),
                        url: getAudioUrl(song),
                        title: song.title,
                        artist: song.artist.name,
                        album: song.album.title || 'Unknown',
                        duration: song.duration,
                        artwork: song.album.cover_medium || song.artist.picture_medium,
                    }));
                    await TrackPlayer.add(tracks);
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
            const tracks = shuffled.map((song) => ({
                id: String(song.id),
                url: getAudioUrl(song),
                title: song.title,
                artist: song.artist.name,
                album: song.album.title || 'Unknown',
                duration: song.duration,
                artwork: song.album.cover_medium || song.artist.picture_medium,
            }));

            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
        } catch (error: any) {
            if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                try {
                    const shuffled = [...songs].sort(() => Math.random() - 0.5);
                    await TrackPlayer.reset();
                    const tracks = shuffled.map((song) => ({
                        id: String(song.id),
                        url: getAudioUrl(song),
                        title: song.title,
                        artist: song.artist.name,
                        album: song.album.title || 'Unknown',
                        duration: song.duration,
                        artwork: song.album.cover_medium || song.artist.picture_medium,
                    }));
                    await TrackPlayer.add(tracks);
                    await TrackPlayer.play();
                } catch (innerError) {
                    console.log('Shuffle retry error:', innerError);
                }
            } else {
                console.log('Shuffle error:', error);
            }
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderSongItem = ({ item, index }: { item: ApiSong; index: number }) => {
        const isActive = activeTrack?.id === String(item.id);
        const hasFullVersion = !!item.fullUrl;
        const playlistData = songs.map((s) => ({
            title: s.title,
            artist: s.artist.name,
            artwork: s.album.cover_medium || s.artist.picture_medium,
            duration: formatDuration(s.duration),
            likes: 0,
            album: s.album.title,
            genre: '',
            url: getAudioUrl(s),
        }));

        return (
            <TouchableOpacity
                style={styles.songItem}
                onPress={() => {
                    navigation.navigate('SongDetail', {
                        song: {
                            title: item.title,
                            artist: item.artist.name,
                            artwork: item.album.cover_medium || item.artist.picture_medium,
                            duration: formatDuration(item.duration),
                            likes: 0,
                            album: item.album.title,
                            genre: '',
                            url: getAudioUrl(item),
                        },
                        playlist: playlistData,
                        currentIndex: index,
                    });
                }}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: item.album.cover_medium }}
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
                            {item.album.title}
                        </Text>
                        {!hasFullVersion && !fetchingFull && (
                            <View style={styles.previewBadge}>
                                <Text style={styles.previewBadgeText}>PREVIEW</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.songRight}>
                    {isActive && isPlaying && <Equalizer isActive={isActive} isPlaying={isPlaying} />}
                    <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
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
                    {artistData?.picture_big ? (
                        <Image source={{ uri: artistData.picture_big }} style={styles.artistImage} />
                    ) : (
                        <View style={styles.artistImageContainer}>
                            <Icon name="person" size={70} color="#1DB954" />
                        </View>
                    )}

                    <Text style={styles.artistName}>{artistData?.name || artist}</Text>

                    <Text style={styles.artistListeners}>
                        {songs.length} tracks found
                    </Text>

                    {fetchingFull && (
                        <View style={styles.fetchingBanner}>
                            <ActivityIndicator size="small" color="#1DB954" />
                            <Text style={styles.fetchingText}>Finding full tracks...</Text>
                        </View>
                    )}

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