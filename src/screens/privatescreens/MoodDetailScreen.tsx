import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
    ImageBackground,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
    usePlaybackState,
    State,
    useActiveTrack,
} from 'react-native-track-player';
import { songToTrack, type Song } from '../../data/songs';
import { saveToRecentlyPlayed } from '../../utils/recentlyPlayed';
import { colors } from '../../theme/Colors';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 280;
const COLLAPSED_BANNER_HEIGHT = 80;
const HEADER_HEIGHT = 110;
const STATUS_BAR_HEIGHT = 60;

const MOOD_EMOJI: { [key: string]: string } = {
    'Defiant': '🔥',
    'Melancholy': '🌧️',
    'Chill': '😎',
    'Energizing': '⚡',
    'Romantic': '❤️',
    'Peaceful': '☮️',
    'Sad': '😢',
    'Fun': '🎉',
    'Focused': '🎯',
    'Rowdy': '🤘',
    'Uplifting': '🌟',
    'Happy': '😊',
    'Unknown': '🎵',
};

const MOOD_IMAGES: { [key: string]: string } = {
    'Chill': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop',
    'Energizing': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    'Peaceful': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    'Uplifting': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop',
    'Happy': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    'Rowdy': 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
    'Defiant': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    'Romantic': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop',
    'Focused': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop',
    'Fun': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    'Melancholy': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    'Sad': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae84d?q=80&w=600&auto=format&fit=crop',
    'Unknown': 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop',
};

const MoodDetailScreen = ({ navigation, route }: any) => {
    const { moodName, moodColor, songs } = route.params;
    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;
    const accent = moodColor || '#1DB954';
    const bannerImage = MOOD_IMAGES[moodName] || MOOD_IMAGES['Unknown'];
    const emoji = MOOD_EMOJI[moodName] || '🎵';

    const scrollY = useRef(new Animated.Value(0)).current;

    const bannerHeight = scrollY.interpolate({
        inputRange: [0, BANNER_HEIGHT - COLLAPSED_BANNER_HEIGHT],
        outputRange: [BANNER_HEIGHT, COLLAPSED_BANNER_HEIGHT],
        extrapolate: 'clamp',
    });

    const bannerOpacity = scrollY.interpolate({
        inputRange: [0, BANNER_HEIGHT - COLLAPSED_BANNER_HEIGHT],
        outputRange: [1, 0.8],
        extrapolate: 'clamp',
    });

    const contentOpacity = scrollY.interpolate({
        inputRange: [0, BANNER_HEIGHT - COLLAPSED_BANNER_HEIGHT],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const titleScale = scrollY.interpolate({
        inputRange: [0, BANNER_HEIGHT - COLLAPSED_BANNER_HEIGHT],
        outputRange: [1, 0.7],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [BANNER_HEIGHT - COLLAPSED_BANNER_HEIGHT - 30, BANNER_HEIGHT - COLLAPSED_BANNER_HEIGHT + 10],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, BANNER_HEIGHT - COLLAPSED_BANNER_HEIGHT],
        outputRange: [-HEADER_HEIGHT - STATUS_BAR_HEIGHT, 0],
        extrapolate: 'clamp',
    });

    const headerPaddingTop = scrollY.interpolate({
        inputRange: [0, BANNER_HEIGHT - COLLAPSED_BANNER_HEIGHT],
        outputRange: [STATUS_BAR_HEIGHT + 10, 10], // Added extra 10px padding
        extrapolate: 'clamp',
    });

    const handlePlaySong = async (song: Song, index: number) => {
        try {
            const isCurrentSong = activeTrack?.url === song.url;
            if (isCurrentSong) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
                return;
            }
            await saveToRecentlyPlayed({
                id: song.id,
                title: song.title,
                artist: song.artist,
                album: song.album,
                duration: song.duration,
                url: song.url,
                artwork: song.artwork || 'https://picsum.photos/seed/song/400',
            });
            await TrackPlayer.reset();
            await TrackPlayer.add(
                songs.map((s: Song) => songToTrack(s))
            );
            await TrackPlayer.skip(index);
            await TrackPlayer.play();
        } catch (error) {
            console.log('Error playing song:', error);
        }
    };

    const handlePlayAll = async () => {
        try {
            await TrackPlayer.reset();
            await TrackPlayer.add(songs.filter((s: Song) => s.url).map((s: Song) => songToTrack(s)));
            await TrackPlayer.play();
        } catch (error) {
            console.log('Error playing all:', error);
        }
    };

    const renderItem = ({ item, index }: { item: Song; index: number }) => {
        const isActive = activeTrack?.url === item.url;
        const isItemPlaying = isActive && playbackState?.state === State.Playing;
        return (
            <TouchableOpacity
                style={[styles.songRow, isActive && { backgroundColor: accent + '18' }]}
                activeOpacity={0.8}
                onPress={() => handlePlaySong(item, index)}
            >
                <View style={styles.songIndexContainer}>
                    <Text style={styles.songIndex}>{index + 1}</Text>
                </View>
                <Image source={{ uri: item.artwork || 'https://picsum.photos/seed/song/200' }} style={styles.songImage} />
                <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, isActive && { color: accent }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
                {isActive && isItemPlaying && (
                    <View style={styles.equalizerContainer}>
                        <View style={[styles.equalizerBar, { backgroundColor: accent }]} />
                        <View style={[styles.equalizerBar, { backgroundColor: accent, height: 16 }]} />
                        <View style={[styles.equalizerBar, { backgroundColor: accent }]} />
                        <View style={[styles.equalizerBar, { backgroundColor: accent, height: 20 }]} />
                        <View style={[styles.equalizerBar, { backgroundColor: accent }]} />
                    </View>
                )}
                <TouchableOpacity
                    style={[styles.playBtn, { backgroundColor: isActive ? accent : accent + 'CC' }]}
                    onPress={() => handlePlaySong(item, index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon name={isItemPlaying ? 'pause' : 'play'} size={16} color="#FFFFFF" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderStickyHeader = () => {
        return (
            <Animated.View
                style={[
                    styles.stickyHeader,
                    {
                        opacity: headerOpacity,
                        transform: [{ translateY: headerTranslateY }],
                        paddingTop: headerPaddingTop,
                    }
                ]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBackBtn}>
                    <Icon name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.stickyTitle} numberOfLines={1}>{moodName}</Text>
                <View style={{ width: 40 }} />
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {renderStickyHeader()}

            <Animated.FlatList
                data={songs}
                renderItem={renderItem}
                keyExtractor={(item: Song) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                ListHeaderComponent={
                    <>
                        <Animated.View style={[styles.bannerContainer, { height: bannerHeight }]}>
                            <ImageBackground
                                source={{ uri: bannerImage }}
                                style={styles.banner}
                                resizeMode="cover"
                            >
                                <Animated.View
                                    style={[
                                        styles.bannerOverlay,
                                        { opacity: bannerOpacity }
                                    ]}
                                >
                                    <View style={styles.bannerBackBtnContainer}>
                                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                            <Icon name="chevron-back" size={24} color="#FFF" />
                                        </TouchableOpacity>
                                        <View style={{ width: 36 }} />
                                    </View>

                                    <Animated.View
                                        style={[
                                            styles.bannerContent,
                                            {
                                                opacity: contentOpacity,
                                                transform: [{ scale: titleScale }]
                                            }
                                        ]}
                                    >
                                        <Text style={styles.bannerEmoji}>{emoji}</Text>
                                        <Text style={styles.bannerTitle}>{moodName}</Text>
                                        <Text style={styles.bannerSubtitle}>{songs.length} songs</Text>
                                        <TouchableOpacity
                                            style={[styles.playAllBtn, { backgroundColor: accent }]}
                                            onPress={handlePlayAll}
                                            activeOpacity={0.8}
                                        >
                                            <Icon name="play" size={18} color="#FFF" />
                                            <Text style={styles.playAllText}>Play All</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                </Animated.View>
                            </ImageBackground>
                        </Animated.View>

                        <View style={styles.songCountContainer}>
                            <Text style={styles.songCountText}>{songs.length} songs</Text>
                        </View>
                    </>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A'
    },

    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    stickyBackBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickyTitle: {
        flex: 1,
        color: colors.white,
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginHorizontal: 12,
        letterSpacing: 0.5,
    },

    bannerContainer: {
        width: '100%',
        overflow: 'hidden',
    },
    banner: {
        flex: 1,
        width: '100%',
    },
    bannerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    bannerBackBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: STATUS_BAR_HEIGHT,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    bannerContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    bannerEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    bannerTitle: {
        color: colors.white,
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 16,
    },
    playAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8,
        shadowColor: colors.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    playAllText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '700'
    },

    songCountContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    songCountText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
    },

    listContent: {
        paddingBottom: 120
    },

    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 8,
        marginVertical: 2,
        borderRadius: 10,
        backgroundColor: 'transparent',
    },
    songIndexContainer: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    songIndex: {
        color: '#555',
        fontSize: 13,
        fontWeight: '500',
    },
    songImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#222'
    },
    songInfo: {
        flex: 1,
        marginRight: 8,
    },
    songTitle: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.2,
        marginBottom: 2,
    },
    songArtist: {
        color: '#888',
        fontSize: 13,
        letterSpacing: 0.2,
    },

    equalizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        height: 24,
        width: 28,
        marginRight: 8,
    },
    equalizerBar: {
        width: 3,
        height: 10,
        borderRadius: 2,
        backgroundColor: colors.green,
    },

    playBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.green,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
});

export default MoodDetailScreen;