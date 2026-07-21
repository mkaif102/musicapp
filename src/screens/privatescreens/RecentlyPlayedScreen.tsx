import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    FlatList,
    Alert,
    Image,
    Dimensions,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { usePlaybackState, State, useActiveTrack } from 'react-native-track-player';
import {
    getRecentlyPlayed,
    clearRecentlyPlayed,
    type RecentSong,
} from '../../utils/recentlyPlayed';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/Colors';

const { width } = Dimensions.get('window');

const parseDuration = (d: string): number => {
    const parts = String(d || '0:00').split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
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
        </View>
    );
};

const RecentlyPlayedScreen = ({ navigation }: any) => {
    const [recentSongs, setRecentSongs] = useState<RecentSong[]>([]);
    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;

    useFocusEffect(
        useCallback(() => {
            loadRecentSongs();
        }, [])
    );

    const loadRecentSongs = async () => {
        const songs = await getRecentlyPlayed();
        setRecentSongs(songs);
    };

    const playAllRecent = async () => {
        if (recentSongs.length === 0) return;
        try {
            const tracks = recentSongs.map((s) => ({
                id: s.id,
                url: s.url,
                title: s.title,
                artist: s.artist,
                album: s.album,
                artwork: s.artwork,
                duration: parseDuration(s.duration),
            }));
            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
        } catch (error) {
            console.log('Play all error:', error);
            Alert.alert('Error', 'Could not play songs.');
        }
    };

    const playSingleSong = async (song: RecentSong) => {
        try {
            if (activeTrack && activeTrack.id === song.id) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
                return;
            }

            const idx = recentSongs.findIndex((s) => s.id === song.id);
            const tracks = recentSongs.map((s) => ({
                id: s.id,
                url: s.url,
                title: s.title,
                artist: s.artist,
                album: s.album,
                artwork: s.artwork,
                duration: parseDuration(s.duration),
            }));

            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            if (idx >= 0) {
                await TrackPlayer.skip(idx);
            }
            await TrackPlayer.play();
        } catch (error) {
            console.log('Song error:', error);
            Alert.alert('Error', 'Could not play song.');
        }
    };

    const handleClearAll = async () => {
        Alert.alert('Clear History', 'Remove all recently played songs?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                    await clearRecentlyPlayed();
                    setRecentSongs([]);
                },
            },
        ]);
    };

    const renderSong = ({ item, index }: { item: RecentSong; index: number }) => {
        const isActive = activeTrack?.id === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.songRow,
                    isActive && styles.songRowActive,
                    !isActive && styles.songRowInactive
                ]}
                onPress={() => playSingleSong(item)}
                activeOpacity={0.7}
            >
                <Image source={{ uri: item.artwork }} style={styles.songImage} />
                <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, isActive && styles.songTitleActive]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                        {item.artist}
                    </Text>
                </View>
                {isActive && isPlaying ? (
                    <Equalizer isActive={isActive} isPlaying={isPlaying} />
                ) : null}
                <TouchableOpacity
                    onPress={() => playSingleSong(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={[styles.songPlayBtn, isActive && styles.songPlayBtnActive]}
                >
                    <Icon
                        name={isActive && isPlaying ? 'pause' : 'play'}
                        size={18}
                        color={isActive ? '#FFFFFF' : '#1DB954'}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recently Played</Text>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                    <Icon name="trash-outline" size={20} color="#1DB954" />
                </TouchableOpacity>
            </View>

            {recentSongs.length > 0 && (
                <View style={styles.headerActions}>
                    <View style={styles.countContainer}>
                        <Text style={styles.countText}>{recentSongs.length} songs</Text>
                    </View>
                    <TouchableOpacity style={styles.playAllButton} onPress={playAllRecent}>
                        <Icon name="play" size={16} color="#FFFFFF" />
                        <Text style={styles.playAllText}>Play All</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

            {recentSongs.length === 0 ? (
                <>
                    {renderHeader()}
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Icon name="time-outline" size={56} color="#FF4444" />
                        </View>
                        <Text style={styles.emptyTitle}>No recently played songs</Text>
                        <Text style={styles.emptySubtitle}>
                            Songs you play will appear here
                        </Text>
                    </View>
                </>
            ) : (
                <FlatList
                    data={recentSongs}
                    keyExtractor={(item) => `${item.id}-${item.playedAt}`}
                    renderItem={renderSong}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A'
    },

    headerContainer: {
        backgroundColor: '#0A0A0A',
        paddingBottom: 12,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 8,
        letterSpacing: 0.5,
    },

    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 4,
    },

    countContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    countText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
    },

    playAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1DB954',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    playAllText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    listContent: {
        paddingBottom: 120,
    },

    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 12,
        marginVertical: 3,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },

    songRowActive: {
        backgroundColor: colors.lightgreen,
    },

    songRowInactive: {
        backgroundColor: 'rgba(255,68,68,0.04)',
        borderColor: 'rgba(255,68,68,0.04)',
    },

    equalizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2.5,
        height: 20,
        width: 30,
        marginRight: 40,
    },

    equalizerBar: {
        width: 3,
        backgroundColor: colors.green,
        borderRadius: 2,
    },

    songImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 14,
        backgroundColor: '#1A1A1A',
    },

    songInfo: {
        flex: 1,
        marginRight: 8,
    },

    songTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
        letterSpacing: 0.2,
    },

    songTitleActive: {
        color: colors.green,
    },

    songArtist: {
        color: '#888',
        fontSize: 13,
        letterSpacing: 0.2,
    },

    songPlayBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },

    songPlayBtnActive: {
        backgroundColor: colors.green,
        borderColor: colors.green,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: -60,
    },

    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,68,68,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,68,68,0.1)',
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 0.3,
    },

    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        letterSpacing: 0.2,
    },
});

export default RecentlyPlayedScreen;