import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    FlatList,
    Alert,
    Image,
    Dimensions,
    Animated,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { usePlaybackState, State, useActiveTrack } from 'react-native-track-player';
import {
    getRecentlyPlayed,
    type RecentSong,
} from '../../utils/recentlyPlayed';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MiniPlayer, { MINI_PLAYER_HEIGHT } from '../../components/MiniPlayer';
import { useMiniPlayerHeight } from '../../hooks/useMiniPlayerHeight';

const removeSongFromRecentlyPlayed = async (songId: string): Promise<void> => {
    try {
        const recent = await getRecentlyPlayed();
        const filtered = recent.filter(song => song.id !== songId);
        await AsyncStorage.setItem('@recently_played', JSON.stringify(filtered));
    } catch (error) {
        console.log('Error removing song from recently played:', error);
        throw error;
    }
};

const removeMultipleSongsFromRecentlyPlayed = async (songIds: string[]): Promise<void> => {
    try {
        const recent = await getRecentlyPlayed();
        const idsToRemove = new Set(songIds);
        const filtered = recent.filter(song => !idsToRemove.has(song.id));
        await AsyncStorage.setItem('@recently_played', JSON.stringify(filtered));
    } catch (error) {
        console.log('Error removing multiple songs from recently played:', error);
        throw error;
    }
};

const parseDuration = (d: string): number => {
    const parts = String(d || '0:00').split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
};

const Equalizer = ({ isActive, isPlaying }: { isActive: boolean; isPlaying: boolean }) => {
    const barHeights = useRef([
        new Animated.Value(8),
        new Animated.Value(12),
        new Animated.Value(6),
        new Animated.Value(16),
        new Animated.Value(10),
    ]).current;

    useEffect(() => {
        let animations: Animated.CompositeAnimation[] = [];

        if (isActive && isPlaying) {
            animations = barHeights.map((bar) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(bar, {
                            toValue: Math.random() * 20 + 6,
                            duration: 300 + Math.random() * 400,
                            useNativeDriver: false,
                            easing: Easing.inOut(Easing.ease),
                        }),
                        Animated.timing(bar, {
                            toValue: Math.random() * 20 + 6,
                            duration: 300 + Math.random() * 400,
                            useNativeDriver: false,
                            easing: Easing.inOut(Easing.ease),
                        }),
                    ])
                );
            });
            animations.forEach(anim => anim.start());
        } else {
            barHeights.forEach((bar) => {
                Animated.timing(bar, {
                    toValue: isActive ? 10 : 4,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            });
        }

        return () => {
            animations.forEach(anim => anim.stop());
        };
    }, [isActive, isPlaying, barHeights]);

    return (
        <View style={styles.equalizerContainer}>
            {barHeights.map((height, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.equalizerBar,
                        {
                            height,
                            backgroundColor: isActive && isPlaying ? '#1DB954' : '#666',
                            opacity: isActive ? 1 : 0.3,
                        }
                    ]}
                />
            ))}
        </View>
    );
};

const RecentlyPlayedScreen = ({ navigation }: any) => {
    const [recentSongs, setRecentSongs] = useState<RecentSong[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);
    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;
    const scrollY = useRef(new Animated.Value(0)).current;
    const miniPlayerHeight = useMiniPlayerHeight();

    useFocusEffect(
        useCallback(() => {
            loadRecentSongs();
        }, [])
    );

    const loadRecentSongs = async () => {
        try {
            const songs = await getRecentlyPlayed();
            setRecentSongs(songs || []);
            setIsAllSelected(false);
            setSelectedSongs(new Set());
        } catch (error) {
            console.log('Error loading recent songs:', error);
            setRecentSongs([]);
        }
    };

    const playAllRecent = async () => {
        if (recentSongs.length === 0) return;
        try {
            const tracks = recentSongs.map((s) => ({
                id: s.id,
                url: s.url || '',
                title: s.title || 'Unknown',
                artist: s.artist || 'Unknown Artist',
                album: s.album || '',
                artwork: s.artwork || '',
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
        if (isSelectionMode) return;

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
                url: s.url || '',
                title: s.title || 'Unknown',
                artist: s.artist || 'Unknown Artist',
                album: s.album || '',
                artwork: s.artwork || '',
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

    const toggleSongSelection = (songId: string) => {
        const newSelected = new Set(selectedSongs);
        if (newSelected.has(songId)) {
            newSelected.delete(songId);
        } else {
            newSelected.add(songId);
        }
        setSelectedSongs(newSelected);
        setIsAllSelected(newSelected.size === recentSongs.length && recentSongs.length > 0);
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedSongs(new Set());
        } else {
            const allIds = new Set(recentSongs.map(s => s.id));
            setSelectedSongs(allIds);
        }
        setIsAllSelected(!isAllSelected);
    };

    const handleDeleteSelected = async () => {
        if (selectedSongs.size === 0) {
            Alert.alert('No Selection', 'Please select songs to delete.');
            return;
        }

        const songIds = Array.from(selectedSongs);
        const songTitles = recentSongs
            .filter(s => selectedSongs.has(s.id))
            .map(s => s.title)
            .slice(0, 3)
            .join(', ');

        const message = selectedSongs.size > 1
            ? `Remove ${selectedSongs.size} selected songs from history?`
            : `Remove "${songTitles}" from history?`;

        Alert.alert(
            'Delete Songs',
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (selectedSongs.size === 1) {
                                await removeSongFromRecentlyPlayed(songIds[0]);
                            } else {
                                await removeMultipleSongsFromRecentlyPlayed(songIds);
                            }

                            const updatedSongs = recentSongs.filter(s => !selectedSongs.has(s.id));
                            setRecentSongs(updatedSongs);
                            setSelectedSongs(new Set());
                            setIsSelectionMode(false);
                            setIsAllSelected(false);
                        } catch (error) {
                            console.log('Delete error:', error);
                            Alert.alert('Error', 'Failed to remove songs.');
                        }
                    },
                },
            ]
        );
    };

    const enterSelectionMode = () => {
        setIsSelectionMode(true);
        setSelectedSongs(new Set());
        setIsAllSelected(false);
    };

    const exitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelectedSongs(new Set());
        setIsAllSelected(false);
    };

    const renderSong = ({ item, index }: { item: RecentSong; index: number }) => {
        const isActive = activeTrack?.id === item.id;
        const isSelected = selectedSongs.has(item.id);

        return (
            <TouchableWithoutFeedback
                key={item.id}
                onPress={() => {
                    if (isSelectionMode) {
                        toggleSongSelection(item.id);
                    } else {
                        playSingleSong(item);
                    }
                }}
                onLongPress={() => {
                    if (!isSelectionMode) {
                        enterSelectionMode();
                        toggleSongSelection(item.id);
                    }
                }}
            >
                <Animated.View
                    style={[
                        styles.songRow,
                        isActive && !isSelectionMode && styles.songRowActive,
                        isSelected && styles.songRowSelected,
                        // Increased padding when in selection mode
                        isSelectionMode && styles.songRowSelectionMode,
                    ]}
                >
                    {isSelectionMode && (
                        <View style={styles.checkboxContainer}>
                            <View style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected
                            ]}>
                                {isSelected && (
                                    <Icon name="checkmark" size={16} color="#FFFFFF" />
                                )}
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={(e) => {
                            e.stopPropagation();
                            if (!isSelectionMode) {
                                playSingleSong(item);
                            }
                        }}
                        style={styles.imageContainer}
                    >
                        <Image
                            source={{ uri: item.artwork || 'https://via.placeholder.com/50' }}
                            style={[
                                styles.songImage,
                                isActive && styles.songImageActive,
                                isSelectionMode && styles.songImageSelectionMode,
                            ]}
                        />

                        {!isSelectionMode && (
                            <View style={[
                                styles.playOverlay,
                                isActive && styles.playOverlayActive
                            ]}>
                                <Icon
                                    name={isActive && isPlaying ? 'pause' : 'play'}
                                    size={22}
                                    color="#FFFFFF"
                                />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.songInfo}>
                        <Text style={[
                            styles.songTitle,
                            isActive && !isSelectionMode && styles.songTitleActive,
                            isSelectionMode && styles.songTitleSelectionMode,
                        ]} numberOfLines={1}>
                            {item.title || 'Unknown'}
                        </Text>
                        <Text style={[
                            styles.songArtist,
                            isActive && !isSelectionMode && styles.songArtistActive,
                            isSelectionMode && styles.songArtistSelectionMode,
                        ]} numberOfLines={1}>
                            {item.artist || 'Unknown Artist'}
                        </Text>
                    </View>

                    {!isSelectionMode && isActive && (
                        <Equalizer isActive={isActive} isPlaying={isPlaying} />
                    )}

                    {isSelectionMode && (
                        <Icon name="reorder-three-outline" size={20} color="#555" />
                    )}
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    };

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="chevron-back" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        {isSelectionMode ? `${selectedSongs.size} Selected` : 'Recently Played'}
                    </Text>

                    {/* {!isSelectionMode && recentSongs.length > 0 && (
                        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                            <Icon name="trash-outline" size={20} color="#FF4444" />
                        </TouchableOpacity>
                    )} */}

                    {isSelectionMode && (
                        <TouchableOpacity style={styles.clearButton} onPress={exitSelectionMode}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {!isSelectionMode && recentSongs.length > 0 && (
                    <View style={styles.headerActions}>
                        <View style={styles.countContainer}>
                            <View style={styles.countBadge}>
                            </View>
                            <Text style={styles.countText}> Total Songs: {recentSongs.length}</Text>

                        </View>

                        <View style={styles.headerActionButtons}>
                            <TouchableOpacity
                                style={styles.playAllButton}
                                onPress={playAllRecent}
                                activeOpacity={0.8}
                            >
                                <Icon name="play" size={14} color="#FFFFFF" />
                                <Text style={styles.playAllText}>Play All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const renderFooterContent = () => {
        return (
            <>
                {!isSelectionMode ? (
                    <TouchableOpacity
                        style={styles.deleteModeButton}
                        onPress={enterSelectionMode}
                        activeOpacity={0.7}
                    >
                        <Icon name="trash-outline" size={22} color="#FF4444" />
                        <Text style={styles.deleteModeText}>Delete Songs</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.selectionFooter}>
                        <View style={styles.selectionInfo}>
                            <Text style={styles.selectionCount}>
                                {selectedSongs.size} selected
                            </Text>
                            <Text style={styles.selectionTotal}>
                                of {recentSongs.length} songs
                            </Text>
                        </View>

                        <View style={styles.selectionActions}>
                            <TouchableOpacity
                                style={styles.selectAllButton}
                                onPress={toggleSelectAll}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name={isAllSelected ? 'checkbox' : 'square-outline'}
                                    size={20}
                                    color={isAllSelected ? '#1DB954' : '#888'}
                                />
                                <Text style={styles.selectAllText}>
                                    {isAllSelected ? 'Deselect All' : 'Select All'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.deleteButton,
                                    selectedSongs.size === 0 && styles.deleteButtonDisabled
                                ]}
                                onPress={handleDeleteSelected}
                                disabled={selectedSongs.size === 0}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    name="trash-outline"
                                    size={20}
                                    color={selectedSongs.size > 0 ? '#FFFFFF' : '#555'}
                                />
                                <Text style={[
                                    styles.deleteButtonText,
                                    selectedSongs.size === 0 && styles.deleteButtonTextDisabled
                                ]}>
                                    Delete {selectedSongs.size > 0 && `(${selectedSongs.size})`}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </>
        );
    };

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
                    keyExtractor={(item, index) => `${item.id}-${item.playedAt || index}`}
                    renderItem={renderSong}
                    ListHeaderComponent={renderHeader}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 160 + miniPlayerHeight }]}
                    ItemSeparatorComponent={() => (
                        <View style={isSelectionMode ? styles.selectionSeparator : styles.normalSeparator} />
                    )}
                />
            )}
            {recentSongs.length > 0 && (
                <View style={[styles.footerContainer, { bottom: miniPlayerHeight > 0 ? 156 : 12 }]}>
                    {renderFooterContent()}
                </View>
            )}
            <MiniPlayer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },

    headerContainer: {
        backgroundColor: '#0A0A0A',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
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
        width: 32,
        height: 32,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    cancelText: {
        color: '#1DB954',
        fontSize: 15,
        fontWeight: '600',
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        // backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        marginHorizontal: 0,
        marginTop: 4,
    },

    countContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
    },

    countBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
        borderRadius: 0,
        gap: 0,
    },

    countText: {
        color: '#1DB954',
        fontSize: 16,
        fontWeight: '700',
    },

    countLabel: {
        color: '#888',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
    },

    headerActionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    selectText: {
        color: '#1DB954',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.2,
    },

    playAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1DB954',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },

    playAllText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    listContent: {
        paddingBottom: 20,
    },

    normalSeparator: {
        height: 2,
    },

    selectionSeparator: {
        height: 8,
    },

    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 12,
        marginVertical: 2,
        borderRadius: 10,
        backgroundColor: 'transparent',
    },

    songRowSelectionMode: {
        paddingVertical: 14,
        marginVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
    },

    songRowActive: {
        backgroundColor: 'rgba(29, 185, 84, 0.08)',
    },

    songRowSelected: {
        backgroundColor: 'rgba(29, 185, 84, 0.12)',
        borderWidth: 1,
        borderColor: '#1DB954',
    },

    checkboxContainer: {
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },

    checkboxSelected: {
        backgroundColor: '#1DB954',
        borderColor: '#1DB954',
    },

    imageContainer: {
        position: 'relative',
        marginRight: 12,
    },

    songImage: {
        width: 52,
        height: 52,
        borderRadius: 8,
        backgroundColor: '#1A1A1A',
    },

    songImageSelectionMode: {
        width: 44,
        height: 44,
        borderRadius: 6,
    },

    songImageActive: {
        borderWidth: 2,
        borderColor: '#1DB954',
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
        opacity: 0,
    },

    playOverlayActive: {
        opacity: 1,
    },

    songInfo: {
        flex: 1,
        marginRight: 8,
    },

    songTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.2,
        marginBottom: 1,
    },

    songTitleSelectionMode: {
        fontSize: 14,
        fontWeight: '500',
    },

    songTitleActive: {
        color: '#1DB954',
    },

    songArtist: {
        color: '#888',
        fontSize: 13,
        letterSpacing: 0.2,
    },

    songArtistSelectionMode: {
        fontSize: 12,
        color: '#777',
    },

    songArtistActive: {
        color: '#aaa',
    },

    equalizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        height: 24,
        width: 40,
        marginRight: 10,
    },

    equalizerBar: {
        width: 4,
        borderRadius: 2,
    },

    footerContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 8,
    },

    deleteModeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 68, 68, 0.08)',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.2)',
        gap: 10,
    },

    deleteModeText: {
        color: '#FF4444',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    selectionFooter: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    selectionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },

    selectionCount: {
        color: '#1DB954',
        fontSize: 18,
        fontWeight: '700',
    },

    selectionTotal: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },

    selectionActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },

    selectAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        flex: 1,
        justifyContent: 'center',
    },

    selectAllText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },

    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF4444',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 8,
        flex: 1.5,
        justifyContent: 'center',
        shadowColor: '#FF4444',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },

    deleteButtonDisabled: {
        backgroundColor: 'rgba(255, 68, 68, 0.15)',
        shadowOpacity: 0,
        elevation: 0,
    },

    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    deleteButtonTextDisabled: {
        color: '#555',
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