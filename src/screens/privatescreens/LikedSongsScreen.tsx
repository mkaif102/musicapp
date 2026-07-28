import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import TrackPlayer, {
    usePlaybackState,
    State,
    useActiveTrack,
} from 'react-native-track-player';
import {
    getLikedSongs,
    toggleLikeSong,
    type LikedSong,
} from '../../utils/likedSongs';
import { colors } from '../../theme/Colors';

const { width } = Dimensions.get('window');
const WAVEFORM_BARS = 40;

const LikedSongsScreen = ({ navigation }: any) => {
    const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;

    useFocusEffect(
        useCallback(() => {
            loadLikedSongs();
        }, [])
    );

    const loadLikedSongs = async () => {
        const songs = await getLikedSongs();
        setLikedSongs(songs);
    };

    const parseDuration = (d: string): number => {
        const parts = String(d || '0:00').split(':').map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return 0;
    };

    const handlePlaySong = async (song: LikedSong, index: number) => {
        try {
            const playUrl = song.cachedPath || song.url;
            const isCurrentSong = activeTrack?.url === playUrl || activeTrack?.url === song.url;
            if (isCurrentSong) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
                return;
            }
            await TrackPlayer.reset();
            await TrackPlayer.add(
                likedSongs.map((s) => ({
                    id: s.id,
                    url: s.cachedPath || s.url,
                    title: s.title,
                    artist: s.artist,
                    artwork: s.artwork,
                    duration: parseDuration(s.duration),
                }))
            );
            await TrackPlayer.skip(index);
            await TrackPlayer.play();
        } catch (error) {
            console.log('Error playing song:', error);
        }
    };

    const playAll = async () => {
        if (likedSongs.length === 0) return;
        try {
            await TrackPlayer.reset();
            await TrackPlayer.add(
                likedSongs.map((s) => ({
                    id: s.id,
                    url: s.cachedPath || s.url,
                    title: s.title,
                    artist: s.artist,
                    artwork: s.artwork,
                    duration: parseDuration(s.duration),
                }))
            );
            await TrackPlayer.play();
        } catch (error) {
            console.log('Error playing liked songs:', error);
        }
    };

    const handleRemoveLike = async (song: LikedSong) => {
        await toggleLikeSong(song);
        loadLikedSongs();
    };

    const generateWaveform = (seed: number) => {
        const bars = [];
        for (let i = 0; i < WAVEFORM_BARS; i++) {
            const h = 4 + Math.abs(Math.sin(seed * 0.1 + i * 0.5)) * 20;
            bars.push(h);
        }
        return bars;
    };

    const renderSong = ({ item, index }: { item: LikedSong; index: number }) => {
        const isActive = activeTrack?.url === (item.cachedPath || item.url) || activeTrack?.url === item.url;
        const isCurrentPlaying = isActive && isPlaying;
        const waveform = generateWaveform(index + 1);

        return (
            <View style={styles.songCard}>
                <TouchableOpacity
                    style={styles.artworkContainer}
                    activeOpacity={0.8}
                    onPress={() => handlePlaySong(item, index)}
                >
                    <Image source={{ uri: item.artwork }} style={styles.songArtwork} />
                    <View style={[styles.playOverlay, isCurrentPlaying && styles.playOverlayActive]}>
                        {isCurrentPlaying ? (
                            <Icon name="pause" size={20} color="#FFFFFF" />
                        ) : (
                            <Icon name="play" size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
                        )}
                    </View>
                </TouchableOpacity>

                <View style={styles.songDetails}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            navigation.navigate('SongDetail', {
                                song: {
                                    title: item.title,
                                    artist: item.artist,
                                    artwork: item.artwork,
                                    duration: item.duration,
                                    likes: item.likes || 0,
                                    album: item.album,
                                    genre: item.genre,
                                    url: item.url,
                                },
                                playlist: likedSongs.map((s) => ({
                                    title: s.title,
                                    artist: s.artist,
                                    artwork: s.artwork,
                                    duration: s.duration,
                                    likes: s.likes || 0,
                                    album: s.album,
                                    genre: s.genre,
                                    url: s.url,
                                })),
                                currentIndex: index,
                            });
                        }}
                    >
                        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                    </TouchableOpacity>

                    <View style={styles.waveformContainer}>
                        {waveform.map((h, i) => {
                            const progress = isActive ? 0.4 : 0;
                            const isFilled = i / WAVEFORM_BARS <= progress;
                            return (
                                <View
                                    key={i}
                                    style={[
                                        styles.waveBar,
                                        { height: h },
                                        isFilled && styles.waveBarFilled,
                                    ]}
                                />
                            );
                        })}
                    </View>

                </View>

                <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => handleRemoveLike(item)}
                >
                    <Icon name="heart" size={18} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Liked Songs</Text>
                    <Text style={styles.headerCount}>{likedSongs.length} tracks</Text>
                </View>
                {/* {likedSongs.length > 0 && (
                    <TouchableOpacity style={styles.playAllBtn} onPress={playAll}>
                        <Icon name="play" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                )} */}
                {/* {likedSongs.length === 0 && <View style={{ width: 38 }} />} */}
            </View>

            {/* {likedSongs.length > 0 && (
                <View style={styles.sortBar}>
                    <TouchableOpacity style={styles.sortItem}>
                        <Icon name="time-outline" size={14} color="#999" />
                        <Text style={styles.sortText}>Recent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortItemActive}>
                        <Icon name="heart" size={14} color="#FF5500" />
                        <Text style={styles.sortTextActive}>Likes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sortItem}>
                        <Icon name="trending-up-outline" size={14} color="#999" />
                        <Text style={styles.sortText}>Reposts</Text>
                    </TouchableOpacity>
                </View>
            )} */}

            {likedSongs.length > 0 ? (
                <FlatList
                    data={likedSongs}
                    renderItem={renderSong}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBox}>
                        <Icon name="heart-outline" size={50} color="#555" />
                    </View>
                    <Text style={styles.emptyTitle}>No liked tracks yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Tap the heart icon on any track to save it here.
                    </Text>
                    <TouchableOpacity
                        style={styles.discoverButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.discoverText}>Explore</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    headerCount: { color: '#888', fontSize: 11, marginTop: 2 },
    playAllBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF5500',
    },

    sortBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 10,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    sortItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortItemActive: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortText: { color: '#999', fontSize: 12, fontWeight: '600' },
    sortTextActive: { color: '#FF5500', fontSize: 12, fontWeight: '600' },

    listContent: {
        paddingTop: 8,
        paddingBottom: 100,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        marginLeft: 100,
    },

    songCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },

    artworkContainer: {
        width: 72,
        height: 72,
        borderRadius: 6,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: '#1E1E1E',
    },
    songArtwork: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playOverlayActive: {
        backgroundColor: 'rgba(255,85,0,0.3)',
    },

    songDetails: {
        flex: 1,
    },
    songTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    songArtist: {
        color: '#999',
        fontSize: 13,
        marginBottom: 8,
    },

    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.5,
        marginBottom: 6,
        height: 24,
    },
    waveBar: {
        width: 2.5,
        borderRadius: 1.5,
        backgroundColor: '#333',
    },
    waveBarFilled: {
        backgroundColor: colors.green,
    },

    songMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaDot: {
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#555',
        marginHorizontal: 2,
    },
    metaText: {
        color: '#777',
        fontSize: 11,
    },

    moreButton: {
        padding: 10,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconBox: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
    },
    emptySubtitle: {
        color: '#777',
        fontSize: 13,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 18,
    },
    discoverButton: {
        marginTop: 24,
        backgroundColor: colors.green,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
    },
    discoverText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

export default LikedSongsScreen;
