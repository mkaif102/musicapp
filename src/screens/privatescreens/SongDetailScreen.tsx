import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
    Animated,
    ScrollView,
    PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
    usePlaybackState,
    State,
    useProgress,
    useActiveTrack,
} from 'react-native-track-player';
import { isSongLiked, toggleLikeSong, getLikedSongs, type LikedSong } from '../../utils/likedSongs';
import { saveToRecentlyPlayed } from '../../utils/recentlyPlayed';

const { width } = Dimensions.get('window');

const parseDuration = (d: string): number => {
    const parts = String(d || '0:00').split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
};

const formatDur = (d?: number) =>
    d ? `${Math.floor(d / 60)}:${String(Math.floor(d % 60)).padStart(2, '0')}` : '0:00';

const resolveCachedUrl = async (url: string): Promise<string> => {
    try {
        const liked = await getLikedSongs();
        const match = liked.find((s) => s.url === url && s.cachedPath);
        return match?.cachedPath || url;
    } catch {
        return url;
    }
};

const SongDetailScreen = ({ navigation, route }: any) => {
    const { song, playlist: initialPlaylist = [], currentIndex: initialIndex = 0 } = route?.params || {};

    const playbackState = usePlaybackState();
    const { position, duration } = useProgress(300);
    const isPlaying = playbackState?.state === State.Playing;
    const activeTrack = useActiveTrack();

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(song?.likes || 0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [isRepeated, setIsRepeated] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [sliderWidth, setSliderWidth] = useState(0);

    const [currentPlaylist, setCurrentPlaylist] = useState(initialPlaylist);
    const [currentIdx, setCurrentIdx] = useState(initialIndex);
    const isMountedRef = useRef(false);
    const songRef = useRef(song);
    const playlistRef = useRef(initialPlaylist);
    const idxRef = useRef(initialIndex);

    const songData = activeTrack
        ? {
            title: activeTrack.title || 'Unknown',
            artist: activeTrack.artist || 'Unknown Artist',
            artwork: activeTrack.artwork || 'https://picsum.photos/seed/song/400',
            duration: activeTrack.duration ? formatDur(activeTrack.duration) : '0:00',
            url: activeTrack.url,
            likes: songRef.current?.likes || 0,
        }
        : songRef.current || {
            title: 'Song Title',
            artist: 'Singer Name',
            artwork: 'https://picsum.photos/seed/song/400',
            duration: '5:55',
            likes: 938,
        };

    const totalDuration = duration > 0 ? duration : parseDuration(songData.duration || '0:00');

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    useEffect(() => {
        const checkLiked = async () => {
            if (songData.title) {
                const liked = await isSongLiked(songData.title);
                setIsLiked(liked);
                setLikeCount(liked ? (songRef.current?.likes || 0) + 1 : (songRef.current?.likes || 0));
            }
        };
        checkLiked();
    }, [songData.title]);

    useEffect(() => {
        if (isMountedRef.current) return;
        isMountedRef.current = true;

        const loadSong = async () => {
            const currentSong = songRef.current;
            if (!currentSong?.url) return;

            const resolvedUrl = await resolveCachedUrl(currentSong.url);

            await saveToRecentlyPlayed({
                id: currentSong.title || 'unknown',
                title: currentSong.title,
                artist: currentSong.artist,
                album: '',
                duration: currentSong.duration || '0:00',
                url: currentSong.url || '',
                artwork: currentSong.artwork || 'https://picsum.photos/seed/song/400',
            });

            try {
                const existingTrack = await TrackPlayer.getActiveTrack();
                if (existingTrack && existingTrack.url === resolvedUrl) {
                    return;
                }
                const queue = await TrackPlayer.getQueue();
                const existingIndex = queue.findIndex((t) => t.url === resolvedUrl);
                if (existingIndex >= 0) {
                    await TrackPlayer.skip(existingIndex);
                    await TrackPlayer.play();
                    return;
                }

                const buildTrack = async (s: any, idx: number) => ({
                    id: s.url || `track-${idx}`,
                    url: await resolveCachedUrl(s.url),
                    title: s.title || 'Unknown',
                    artist: s.artist || 'Unknown Artist',
                    artwork: s.artwork || 'https://picsum.photos/seed/song/400',
                    duration: parseDuration(s.duration || '0:00'),
                });

                const pl = playlistRef.current;
                const idx = idxRef.current;

                if (pl.length > 0) {
                    const tracks = await Promise.all(pl.map((s: any, i: number) => buildTrack(s, i)));
                    await TrackPlayer.reset();
                    await TrackPlayer.add(tracks);
                    const targetIndex = pl.findIndex((s: any) => s.url === currentSong.url);
                    const skipTo = targetIndex >= 0 ? targetIndex : idx;
                    await TrackPlayer.skip(skipTo);
                    await TrackPlayer.play();
                    if (skipTo !== idx) setCurrentIdx(skipTo);
                } else {
                    const track = await buildTrack(currentSong, 0);
                    await TrackPlayer.reset();
                    await TrackPlayer.add(track);
                    await TrackPlayer.play();
                }
            } catch (error: any) {
                if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                    try {
                        const currentSong2 = songRef.current;
                        const pl2 = playlistRef.current;
                        const idx2 = idxRef.current;
                        await TrackPlayer.reset();
                        if (pl2.length > 0) {
                            const tracks = await Promise.all(pl2.map(async (s: any, i: number) => ({
                                id: s.url || `track-${i}`,
                                url: await resolveCachedUrl(s.url),
                                title: s.title || 'Unknown',
                                artist: s.artist || 'Unknown Artist',
                                artwork: s.artwork || 'https://picsum.photos/seed/song/400',
                                duration: parseDuration(s.duration || '0:00'),
                            })));
                            await TrackPlayer.add(tracks);
                            const targetIndex = pl2.findIndex((s: any) => s.url === currentSong2?.url);
                            const skipTo = targetIndex >= 0 ? targetIndex : idx2;
                            await TrackPlayer.skip(skipTo);
                            await TrackPlayer.play();
                        } else {
                            await TrackPlayer.add({
                                id: currentSong2?.title || 'unknown',
                                url: await resolveCachedUrl(currentSong2?.url || ''),
                                title: currentSong2?.title || 'Unknown',
                                artist: currentSong2?.artist || 'Unknown Artist',
                                artwork: currentSong2?.artwork || 'https://picsum.photos/seed/song/400',
                                duration: parseDuration(currentSong2?.duration || '0:00'),
                            });
                            await TrackPlayer.play();
                        }
                    } catch (innerError) {
                        console.log('Auto-play retry error:', innerError);
                    }
                } else {
                    console.log('Auto-play error:', error);
                }
            }
        };
        loadSong();
    }, []);

    useEffect(() => {
        if (currentPlaylist.length > 0 && activeTrack?.url) {
            const foundIndex = currentPlaylist.findIndex((t: any) => t.url === activeTrack.url);
            if (foundIndex >= 0) {
                setCurrentIdx((prev: number) => (prev !== foundIndex ? foundIndex : prev));
            }
        }
    }, [activeTrack?.url, currentPlaylist]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = async () => {
        try {
            const existingTrack = await TrackPlayer.getActiveTrack();
            if (existingTrack) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
            } else {
                const currentSong = songRef.current;
                const pl = playlistRef.current;
                const idx = playlistRef.current.length > 0 ? currentIdx : 0;

                const buildTrack = async (s: any, i: number) => ({
                    id: s.url || `track-${i}`,
                    url: await resolveCachedUrl(s.url),
                    title: s.title || 'Unknown',
                    artist: s.artist || 'Unknown Artist',
                    artwork: s.artwork || 'https://picsum.photos/seed/song/400',
                    duration: parseDuration(s.duration || '0:00'),
                });

                if (pl.length > 0) {
                    const tracks = await Promise.all(pl.map((s: any, i: number) => buildTrack(s, i)));
                    await TrackPlayer.reset();
                    await TrackPlayer.add(tracks);
                    const targetIndex = pl.findIndex((s: any) => s.url === currentSong?.url);
                    const skipTo = targetIndex >= 0 ? targetIndex : idx;
                    await TrackPlayer.skip(skipTo);
                    await TrackPlayer.play();
                } else {
                    await TrackPlayer.reset();
                    await TrackPlayer.add(await buildTrack(currentSong, 0));
                    await TrackPlayer.play();
                }
            }
        } catch (error: any) {
            if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                try {
                    const currentSong = songRef.current;
                    await TrackPlayer.reset();
                    await TrackPlayer.add({
                        id: currentSong?.url || 'unknown',
                        url: await resolveCachedUrl(currentSong?.url || ''),
                        title: currentSong?.title || 'Unknown',
                        artist: currentSong?.artist || 'Unknown Artist',
                        artwork: currentSong?.artwork || 'https://picsum.photos/seed/song/400',
                        duration: parseDuration(currentSong?.duration || '0:00'),
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

    const handleSeek = async (time: number) => {
        try {
            await TrackPlayer.seekTo(time);
        } catch (error) {
            console.log('Seek error:', error);
        }
    };

    // 10 seconds forward function
    const handleSeekForward = async () => {
        const currentPosition = position;
        const newPosition = Math.min(currentPosition + 10, totalDuration);
        await handleSeek(newPosition);
    };

    // 10 seconds backward function
    const handleSeekBackward = async () => {
        const currentPosition = position;
        const newPosition = Math.max(currentPosition - 10, 0);
        await handleSeek(newPosition);
    };

    const handleLike = async () => {
        const likedSong: LikedSong = {
            id: songData.title || 'unknown',
            title: songData.title || 'Unknown',
            artist: songData.artist || 'Unknown Artist',
            artwork: songData.artwork || 'https://picsum.photos/seed/song/400',
            duration: songData.duration || '0:00',
            url: songRef.current?.url || '',
            likes: songData.likes || 0,
        };
        const nowLiked = await toggleLikeSong(likedSong);
        setIsLiked(nowLiked);
        setLikeCount((prev: number) => nowLiked ? prev + 1 : Math.max(0, prev - 1));
    };

    const handleShuffle = () => {
        setIsShuffled(!isShuffled);
    };

    const handleRepeat = () => {
        setIsRepeated(!isRepeated);
    };

    const handleSkipBack = async () => {
        try {
            const queue = await TrackPlayer.getQueue();
            const activeIndex = await TrackPlayer.getActiveTrackIndex();

            if (currentPlaylist.length > 0) {
                const targetIndex = currentIdx > 0 ? currentIdx - 1 : 0;
                await TrackPlayer.skip(targetIndex);
                await TrackPlayer.play();
                setCurrentIdx(targetIndex);
                return;
            }

            if (queue.length > 0 && activeIndex != null && activeIndex > 0) {
                const prevIndex = activeIndex - 1;
                await TrackPlayer.skip(prevIndex);
                await TrackPlayer.play();
                const mappedPlaylist = queue.map((t) => ({
                    title: t.title,
                    artist: t.artist,
                    artwork: t.artwork,
                    duration: formatDur(t.duration),
                    url: t.url,
                    likes: 0,
                }));
                setCurrentPlaylist(mappedPlaylist);
                setCurrentIdx(prevIndex);
            }
        } catch (error) {
            console.log('Skip back error:', error);
        }
    };

    const handleSkipForward = async () => {
        try {
            const queue = await TrackPlayer.getQueue();
            const activeIndex = await TrackPlayer.getActiveTrackIndex();

            if (currentPlaylist.length > 0) {
                const targetIndex = currentIdx < currentPlaylist.length - 1 ? currentIdx + 1 : currentIdx;
                await TrackPlayer.skip(targetIndex);
                await TrackPlayer.play();
                setCurrentIdx(targetIndex);
                return;
            }

            if (queue.length > 0 && activeIndex != null && activeIndex < queue.length - 1) {
                const nextIndex = activeIndex + 1;
                await TrackPlayer.skip(nextIndex);
                await TrackPlayer.play();
                const mappedPlaylist = queue.map((t) => ({
                    title: t.title,
                    artist: t.artist,
                    artwork: t.artwork,
                    duration: formatDur(t.duration),
                    url: t.url,
                    likes: 0,
                }));
                setCurrentPlaylist(mappedPlaylist);
                setCurrentIdx(nextIndex);
            }
        } catch (error) {
            console.log('Skip forward error:', error);
        }
    };

    const panResponder = PanResponder.create({
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

    const handleProgressPress = (event: any) => {
        const { locationX } = event.nativeEvent;
        if (sliderWidth > 0) {
            const progress = Math.max(0, Math.min(1, locationX / sliderWidth));
            const seekTime = progress * totalDuration;
            handleSeek(seekTime);
        }
    };

    const progressPercent = totalDuration > 0 ? (position / totalDuration) * 100 : 0;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.albumArtContainer}>
                        <Image
                            source={{ uri: songData.artwork }}
                            style={styles.albumArt}
                            resizeMode="cover"
                        />
                    </View>

                    <View style={styles.songInfo}>
                        <Text style={styles.songTitle}>{songData.title}</Text>
                        <Text style={styles.songArtist}>{songData.artist}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={handleLike}
                    >
                        <Icon
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={isLiked ? "#FF6B6B" : "#FFFFFF"}
                        />
                        <Text style={styles.likeCount}>{likeCount}</Text>
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
                                onPress={handleProgressPress}
                                activeOpacity={1}
                            >
                                <View style={styles.progressBackground}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${Math.min(progressPercent, 100)}%` }
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.progressThumb,
                                            { left: `${Math.min(progressPercent, 100)}%` }
                                        ]}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>{formatTime(position)}</Text>
                            <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
                        </View>
                    </View>

                    <View style={styles.controlsContainer}>
                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleShuffle}
                        >
                            {/* <Icon
                                name="shuffle"
                                size={24}
                                color={isShuffled ? "#1DB954" : "#FFFFFF"}
                            /> */}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton} onPress={handleSkipBack}>
                            <Icon name="play-skip-back" size={28} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton} onPress={handleSeekBackward}>
                            <Icon name="play-back" size={24} color="#FFFFFF" />
                            <Text style={styles.seekLabel}>10</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={handlePlayPause}
                        >
                            <Icon
                                name={isPlaying ? "pause" : "play"}
                                size={36}
                                color="#121212"
                            />
                        </TouchableOpacity>

                        {/* 10 Sec Forward Button */}
                        <TouchableOpacity style={styles.controlButton} onPress={handleSeekForward}>
                            <Icon name="play-forward" size={24} color="#FFFFFF" />
                            <Text style={styles.seekLabel}>10</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton} onPress={handleSkipForward}>
                            <Icon name="play-skip-forward" size={28} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.controlButton}
                            onPress={handleRepeat}
                        >
                            {/* <Icon
                                name="repeat"
                                size={24}
                                color={isRepeated ? "#1DB954" : "#FFFFFF"}
                            /> */}
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    albumArtContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    albumArt: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: 20,
        backgroundColor: '#2C2C2C',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    songInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    songTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 4,
    },
    songArtist: {
        textAlign: 'center',
        color: '#B3B3B3',
        fontSize: 16,
        fontWeight: '400',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 8,
    },
    likeCount: {
        color: '#B3B3B3',
        fontSize: 14,
        fontWeight: '500',
    },
    progressContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    progressBarContainer: {
        width: '100%',
        height: 30,
        justifyContent: 'center',
    },
    progressTouchable: {
        width: '100%',
        height: 30,
        justifyContent: 'center',
    },
    progressBackground: {
        width: '100%',
        height: 4,
        backgroundColor: '#3D3D3D',
        borderRadius: 2,
        justifyContent: 'center',
    },
    progressFill: {
        height: 4,
        backgroundColor: '#1DB954',
        borderRadius: 2,
    },
    progressThumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#1DB954',
        marginLeft: -8,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        marginTop: 8,
    },
    timeText: {
        color: '#B3B3B3',
        fontSize: 12,
        fontWeight: '400',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 4,
    },
    controlButton: {
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 44,
    },
    seekLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginTop: -2,
    },
    playButton: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});

export default SongDetailScreen;