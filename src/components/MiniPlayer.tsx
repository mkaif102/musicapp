import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
    usePlaybackState,
    State,
    useActiveTrack,
} from 'react-native-track-player';
import { colors } from '../theme/Colors';

const MiniPlayerContent = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const activeTrack = useActiveTrack();
    const playbackState = usePlaybackState();
    const isPlaying = playbackState?.state === State.Playing;

    // Animation values for equalizer bars
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
            // Start equalizer animation
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
            // Reset bars to default height
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

    if (!activeTrack || route.name === 'SongDetail') return null;

    const handlePlayPause = async () => {
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

    const handleClose = async () => {
        try {
            await TrackPlayer.stop();
            await TrackPlayer.reset();
        } catch (error) {
            console.log('Mini player close error:', error);
        }
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
        <TouchableOpacity
            style={styles.container}
            onPress={handleTap}
            activeOpacity={0.9}
        >

            <View style={styles.content}>
                <Image
                    source={{ uri: (activeTrack.artwork as string) || 'https://picsum.photos/seed/song/100' }}
                    style={styles.artwork}
                />
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                        {activeTrack.title || 'Unknown'}
                    </Text>
                    <Text style={styles.artist} numberOfLines={1}>
                        {activeTrack.artist || 'Unknown Artist'}
                    </Text>
                </View>
                {isPlaying ? (
                    <View style={styles.equalizerContainer}>
                        <Animated.View style={[styles.equalizerBar, { height: barHeights[0] }]} />
                        <Animated.View style={[styles.equalizerBar, { height: barHeights[1] }]} />
                        <Animated.View style={[styles.equalizerBar, { height: barHeights[2] }]} />
                        <Animated.View style={[styles.equalizerBar, { height: barHeights[3] }]} />
                        <Animated.View style={[styles.equalizerBar, { height: barHeights[4] }]} />
                    </View>
                ) : null}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={handlePlayPause}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon
                            name={isPlaying ? 'pause' : 'play'}
                            size={20}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon
                            name="close"
                            size={16}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

class MiniPlayer extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any) {
        console.log('MiniPlayer error caught:', error?.message);
    }

    render() {
        if (this.state.hasError) return null;
        return <MiniPlayerContent />;
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 76,
        left: 12,
        right: 12,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    artwork: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#2A2A2A',
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
    equalizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 10,
        height: 28,
        width: 40,
    },
    equalizerBar: {
        width: 3,
        backgroundColor: colors.green,
        borderRadius: 2,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default MiniPlayer;