import React, { useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
    usePlaybackState,
    State,
    useActiveTrack,
    useProgress,
} from 'react-native-track-player';
import { colors } from '../theme/Colors';

export const MINI_PLAYER_HEIGHT = 110;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MiniPlayerContent = () => {
    const navigation = useNavigation<any>();

    const activeTrack = useActiveTrack();
    const playbackState = usePlaybackState();
    const isPlaying = playbackState?.state === State.Playing;
    const { position, duration } = useProgress(1000);

    const barHeights = useRef([
        new Animated.Value(8),
        new Animated.Value(16),
        new Animated.Value(10),
        new Animated.Value(20),
        new Animated.Value(12),
    ]).current;

    useEffect(() => {
        let animations: Animated.CompositeAnimation[] = [];

        if (isPlaying) {
            animations = barHeights.map((bar) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(bar, {
                            toValue: Math.random() * 20 + 8,
                            duration: 300 + Math.random() * 200,
                            useNativeDriver: false,
                        }),
                        Animated.timing(bar, {
                            toValue: Math.random() * 20 + 8,
                            duration: 300 + Math.random() * 200,
                            useNativeDriver: false,
                        }),
                        Animated.timing(bar, {
                            toValue: Math.random() * 20 + 8,
                            duration: 300 + Math.random() * 200,
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
    }, [isPlaying]);

    const handleSeek = useCallback(async (e: any) => {
        try {
            const x = e?.nativeEvent?.locationX;
            if (x == null) return;
            const barWidth = SCREEN_WIDTH - 24;
            const ratio = Math.max(0, Math.min(1, x / barWidth));
            const seekTime = ratio * (duration || 0);
            await TrackPlayer.seekTo(seekTime);
        } catch (error) {
            console.log('Mini player seek error:', error);
        }
    }, [duration]);

    if (!activeTrack) return null;

    const handlePlayPause = async (e: any) => {
        e.stopPropagation();
        try {
            if (isPlaying) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.play();
            }
        } catch (error) {
            console.log('Mini player play/pause error:', error);
        }
    };

    const handleClose = async (e: any) => {
        e.stopPropagation();
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
        } catch (error) {
            console.log('Mini player close error:', error);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    const getArtworkUri = (artwork: unknown): string => {
        if (!artwork) return 'https://picsum.photos/seed/song/100';
        if (typeof artwork === 'string') return artwork;
        if (typeof artwork === 'object' && artwork !== null) {
            const { uri } = artwork as { uri?: string };
            if (typeof uri === 'string' && uri) return uri;
        }
        return 'https://picsum.photos/seed/song/100';
    };

    const handleTap = async () => {
        try {
            const queue = await TrackPlayer.getQueue();
            const activeIndex = await TrackPlayer.getActiveTrackIndex();
            const idx = activeIndex ?? 0;

            const formatDuration = (d?: number) =>
                d ? `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}` : '0:00';

            const mappedPlaylist = queue.map((t) => ({
                title: t.title,
                artist: t.artist,
                artwork: t.artwork,
                duration: formatDuration(t.duration),
                url: t.url,
                likes: 0,
            }));

            navigation.navigate('SongDetail', {
                song: {
                    title: activeTrack.title,
                    artist: activeTrack.artist,
                    artwork: activeTrack.artwork,
                    duration: formatDuration(activeTrack.duration),
                    url: activeTrack.url,
                    likes: 0,
                },
                playlist: mappedPlaylist.length > 0 ? mappedPlaylist : [{
                    title: activeTrack.title,
                    artist: activeTrack.artist,
                    artwork: activeTrack.artwork,
                    duration: formatDuration(activeTrack.duration),
                    url: activeTrack.url,
                    likes: 0,
                }],
                currentIndex: idx,
            });
        } catch (error) {
            console.log('MiniPlayer navigate error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handlePlayPause}
                    style={styles.imageContainer}
                >
                    <Image
                        source={{ uri: getArtworkUri(activeTrack.artwork) }}
                        style={styles.artwork}
                    />

                    <View style={styles.playOverlay}>
                        <Icon
                            name={isPlaying ? 'pause' : 'play'}
                            size={20}
                            color="#1DB954"
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.info}
                    onPress={handleTap}
                    activeOpacity={0.8}
                >
                    <Text style={styles.title} numberOfLines={1}>
                        {activeTrack.title || 'Unknown'}
                    </Text>
                    <Text style={styles.artist} numberOfLines={1}>
                        {activeTrack.artist || 'Unknown Artist'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.progressContainer}
                onPress={handleSeek}
                activeOpacity={1}
            >
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    <View style={[styles.progressThumb, { left: `${progress}%` }]} />
                </View>
                <View style={styles.timeRow}>
                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90,
        left: 12,
        right: 12,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        zIndex: 999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    artwork: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#2A2A2A',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    title: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    artist: {
        color: '#A0A0A0',
        fontSize: 12,
        marginTop: 2,
        letterSpacing: 0.2,
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    progressContainer: {
        marginTop: 8,
        paddingHorizontal: 2,
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        position: 'relative',
        justifyContent: 'center',
    },
    progressFill: {
        height: 4,
        backgroundColor: colors.green,
        borderRadius: 2,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    progressThumb: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.green,
        position: 'absolute',
        marginLeft: -5,
        top: -3,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    timeText: {
        color: '#777',
        fontSize: 10,
        fontWeight: '500',
    },
});

export default MiniPlayerContent;
