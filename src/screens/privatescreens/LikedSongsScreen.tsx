import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
    PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import TrackPlayer, {
    usePlaybackState,
    State,
    useActiveTrack,
    useProgress,
} from 'react-native-track-player';
import {
    getLikedSongs,
    toggleLikeSong,
    type LikedSong,
} from '../../utils/likedSongs';
import { colors } from '../../theme/Colors';

const { width } = Dimensions.get('window');

const LikedSongsScreen = ({ navigation }: any) => {
    const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const { position, duration } = useProgress(300);
    const isPlaying = playbackState?.state === State.Playing;
    const [sliderWidth, setSliderWidth] = useState(0);

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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = async (time: number) => {
        try {
            await TrackPlayer.seekTo(time);
        } catch (error) {
            console.log('Seek error:', error);
        }
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

    const createPanResponder = (totalDuration: number) => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => { },
            onPanResponderMove: (evt) => {
                if (sliderWidth > 0) {
                    const touchX = evt.nativeEvent.locationX;
                    const progress = Math.max(0, Math.min(1, touchX / sliderWidth));
                    const seekTime = progress * totalDuration;
                    handleSeek(seekTime);
                }
            },
            onPanResponderRelease: () => { },
        });
    };

    const handleProgressPress = (event: any, totalDuration: number) => {
        const { locationX } = event.nativeEvent;
        if (sliderWidth > 0) {
            const progress = Math.max(0, Math.min(1, locationX / sliderWidth));
            const seekTime = progress * totalDuration;
            handleSeek(seekTime);
        }
    };

    const renderSong = ({ item, index }: { item: LikedSong; index: number }) => {
        const isActive = activeTrack?.url === (item.cachedPath || item.url) || activeTrack?.url === item.url;
        const isCurrentPlaying = isActive && isPlaying;
        const songDuration = parseDuration(item.duration);
        const currentPosition = isActive ? position : 0;
        const totalDuration = isActive ? duration : songDuration;
        const progressPercent = totalDuration > 0 ? (currentPosition / totalDuration) * 100 : 0;
        const panResponder = createPanResponder(totalDuration);

        return (
            <View style={[styles.songCard, isActive && styles.songCardActive]}>
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

                    <View style={styles.progressContainer}>
                        <View
                            style={styles.progressBarContainer}
                            onLayout={(event) => {
                                const { width: w } = event.nativeEvent.layout;
                                setSliderWidth(w);
                            }}
                            {...panResponder.panHandlers}
                        >
                            <TouchableOpacity
                                style={styles.progressTouchable}
                                onPress={(event) => handleProgressPress(event, totalDuration)}
                                activeOpacity={1}
                            >
                                <View style={styles.progressBackground}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${Math.min(progressPercent, 100)}%` }
                                        ]}
                                    />
                                    {isActive && (
                                        <View
                                            style={[
                                                styles.progressThumb,
                                                { left: `${Math.min(progressPercent, 100)}%` }
                                            ]}
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>
                                {isActive ? formatTime(currentPosition) : formatTime(0)}
                            </Text>
                            <Text style={styles.timeText}>
                                {formatTime(totalDuration)}
                            </Text>
                        </View>
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
                    <Icon name="chevron-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Liked Songs</Text>
                    <Text style={styles.headerCount}>{likedSongs.length} tracks</Text>
                </View>
            </View>

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

    listContent: {
        paddingTop: 8,
        paddingBottom: 100,
        paddingHorizontal: 12,
    },
    separator: {
        height: 8,
        backgroundColor: 'transparent',
    },

    songCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        marginHorizontal: 4,
    },
    songCardActive: {
        backgroundColor: 'rgba(29,185,84,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(29,185,84,0.2)',
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
        marginRight: 8,
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

    progressContainer: {
        width: '100%',
    },
    progressBarContainer: {
        width: '100%',
        height: 24,
        justifyContent: 'center',
    },
    progressTouchable: {
        width: '100%',
        height: 24,
        justifyContent: 'center',
    },
    progressBackground: {
        width: '100%',
        height: 3,
        backgroundColor: '#3D3D3D',
        borderRadius: 2,
        justifyContent: 'center',
    },
    progressFill: {
        height: 3,
        backgroundColor: '#1DB954',
        borderRadius: 2,
    },
    progressThumb: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1DB954',
        marginLeft: -6,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
        marginTop: 2,
    },
    timeText: {
        color: '#888',
        fontSize: 10,
        fontWeight: '400',
    },

    moreButton: {
        padding: 10,
        alignSelf: 'flex-start',
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