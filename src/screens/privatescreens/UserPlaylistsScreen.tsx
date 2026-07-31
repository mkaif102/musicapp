import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    FlatList,
    Image,
    Alert,
    Dimensions,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { State, RepeatMode, usePlaybackState, useActiveTrack } from 'react-native-track-player';
import { colors } from '../../theme/Colors';
import { useMiniPlayerHeight } from '../../hooks/useMiniPlayerHeight';
import {
    getCustomPlaylists,
    deleteCustomPlaylist,
    type CustomPlaylist,
} from '../../utils/customPlaylists';
import { parseDuration } from '../../data/songs';

const { width } = Dimensions.get('window');

const UserPlaylistsScreen = ({ navigation }: any) => {
    const [customPlaylists, setCustomPlaylists] = useState<CustomPlaylist[]>([]);
    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;
    const miniPlayerHeight = useMiniPlayerHeight();
    const [scaleAnim] = useState(new Animated.Value(1));

    const loadPlaylists = async () => {
        const playlists = await getCustomPlaylists();
        setCustomPlaylists(playlists);
    };

    useEffect(() => {
        loadPlaylists();
    }, []);

    const calculateTotalDuration = (songs: { duration: string }[]) => {
        let totalSeconds = 0;
        songs.forEach(song => {
            const parts = song.duration.split(':').map(Number);
            if (parts.length === 2) {
                totalSeconds += parts[0] * 60 + parts[1];
            }
        });
        const minutes = Math.floor(totalSeconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) return `${hours}h ${minutes % 60}min`;
        return `${minutes}min`;
    };

    const playPlaylist = async (playlist: CustomPlaylist) => {
        if (!playlist.songs || playlist.songs.length === 0) {
            Alert.alert('No Songs', 'This playlist has no songs yet.');
            return;
        }
        try {
            const tracks = playlist.songs.map(s => ({
                id: s.id,
                url: s.url,
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: parseDuration(s.duration),
                artwork: s.artwork,
            }));
            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
        } catch (error) {
            console.log('Playlist playback error:', error);
        }
    };

    const playSingleSong = async (song: any, songs: any[]) => {
        try {
            const tracks = songs.map(s => ({
                id: s.id,
                url: s.url,
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: parseDuration(s.duration),
                artwork: s.artwork,
            }));
            const songIndex = songs.findIndex(s => s.id === song.id);
            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            if (songIndex >= 0) await TrackPlayer.skip(songIndex);
            await TrackPlayer.play();
        } catch (error) {
            console.log('Song playback error:', error);
        }
    };

    const handleDeletePlaylist = (playlist: CustomPlaylist) => {
        Alert.alert(
            'Delete Playlist',
            `Delete "${playlist.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteCustomPlaylist(playlist.id);
                        await loadPlaylists();
                    },
                },
            ],
        );
    };

    const animatePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Playlist item render - ab isme songs bhi show honge
    const renderPlaylistItem = ({ item }: { item: CustomPlaylist }) => {
        const firstSongArtwork = item.songs[0]?.artwork;
        const isActive = activeTrack && item.songs.some(s => s.id === activeTrack.id);

        return (
            <View style={styles.playlistItemContainer}>
                {/* Playlist Header Card */}
                <Animated.View style={[styles.playlistCard, { transform: [{ scale: scaleAnim }] }]}>
                    <TouchableOpacity
                        style={styles.playlistInfoRow}
                        onPress={() =>
                            navigation.navigate('PlaylistDetail', {
                                playlist: item,
                                songs: item.songs,
                            })
                        }
                        onLongPress={() => handleDeletePlaylist(item)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.artworkContainer}>
                            {firstSongArtwork ? (
                                <Image source={{ uri: firstSongArtwork }} style={styles.playlistArtwork} />
                            ) : (
                                <View style={[styles.playlistArtwork, styles.playlistArtworkFallback, { backgroundColor: item.color + '22' }]}>
                                    <Icon name="musical-notes" size={28} color={item.color || '#1DB954'} />
                                </View>
                            )}
                            {item.songs.length > 1 && (
                                <View style={styles.songCountBadge}>
                                    <Text style={styles.songCountText}>{item.songs.length}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.playlistInfo}>
                            <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.playlistMetaRow}>
                                <Text style={styles.playlistMeta}>
                                    {item.songs.length} track{item.songs.length !== 1 ? 's' : ''}
                                </Text>
                                <View style={styles.metaDot} />
                                <Text style={styles.playlistMeta}>{calculateTotalDuration(item.songs)}</Text>
                                {isActive && (
                                    <>
                                        <View style={styles.metaDot} />
                                        <View style={styles.playingIndicator}>
                                            <Icon name="volume-high" size={12} color={colors.green} />
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.playButton, isActive && styles.playButtonActive]}
                        onPress={() => {
                            animatePress();
                            playPlaylist(item);
                        }}
                    >
                        <Icon
                            name={isPlaying && isActive ? 'pause' : 'play'}
                            size={20}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </Animated.View>

                {renderPlaylistSongs(item)}
            </View>
        );
    };

    // Individual song item render
    const renderSongItem = (song: any, index: number, playlist: CustomPlaylist) => {
        const isActive = activeTrack?.id === song.id;
        return (
            <TouchableOpacity
                key={song.id}
                style={[styles.songRow, isActive && styles.songRowActive]}
                onPress={() => playSingleSong(song, playlist.songs)}
                activeOpacity={0.7}
            >
                <View style={styles.songNumberContainer}>
                    {isActive ? (
                        <View style={styles.activeSongIndicator}>
                            <View style={styles.waveBar} />
                            <View style={[styles.waveBar, styles.waveBar2]} />
                            <View style={[styles.waveBar, styles.waveBar3]} />
                        </View>
                    ) : (
                        <Text style={styles.songNumber}>{index + 1}</Text>
                    )}
                </View>
                <Image
                    source={{ uri: song.artwork || 'https://picsum.photos/seed/song/400' }}
                    style={[styles.songArtwork, isActive && styles.songArtworkActive]}
                />
                <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, isActive && styles.songTitleActive]} numberOfLines={1}>
                        {song.title}
                        {isActive && <Text style={styles.nowPlayingText}> • Now Playing</Text>}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                </View>
                <Text style={styles.songDuration}>{song.duration}</Text>
            </TouchableOpacity>
        );
    };

    const renderPlaylistSongs = (playlist: CustomPlaylist) => {
        if (!playlist.songs || playlist.songs.length === 0) {
            return (
                <View style={styles.emptySongsContainer}>
                    <Icon name="music-note-outline" size={24} color="#444" />
                    <Text style={styles.emptySongsText}>No songs in this playlist</Text>
                    <TouchableOpacity
                        style={styles.addSongButton}
                        onPress={() => navigation.navigate('Library')}
                    >
                        <Text style={styles.addSongButtonText}>Add Songs</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.songsContainer}>
                <View style={styles.songsHeader}>
                    <Text style={styles.songsHeaderTitle}>Songs</Text>
                    <Text style={styles.songsHeaderCount}>{playlist.songs.length} tracks</Text>
                </View>
                {playlist.songs.map((song, index) => renderSongItem(song, index, playlist))}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Icon name="albums-outline" size={72} color="#2A2A2A" />
                <View style={styles.emptyIconOverlay}>
                    <Icon name="add-circle" size={32} color={colors.green} />
                </View>
            </View>
            <Text style={styles.emptyTitle}>No Playlists Yet</Text>
            <Text style={styles.emptySubtitle}>
                Create your first playlist from the Library tab
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Library')}>
                <Text style={styles.emptyButtonText}>Go to Library</Text>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Playlists</Text>
                </View>

                {customPlaylists.length > 0 ? (
                    <FlatList
                        data={customPlaylists}
                        renderItem={renderPlaylistItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + miniPlayerHeight }]}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        // ListHeaderComponent={() => (
                        //     <View style={styles.listHeader}>
                        //         <Text style={styles.listHeaderTitle}>
                        //             {customPlaylists.length} Playlist{customPlaylists.length !== 1 ? 's' : ''}
                        //         </Text>
                        //     </View>
                        // )}
                        ListFooterComponent={() => (
                            <View style={styles.footerNote}>
                                <Icon name="information-circle-outline" size={14} color="#444" />
                                <Text style={styles.footerNoteText}>Long press a playlist to delete it</Text>
                            </View>
                        )}
                        stickyHeaderIndices={[0]}
                    />
                ) : (
                    renderEmptyState()
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0A0A0A'
    },
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // ye important hai
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        flex: 1,
    },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.02)',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    listHeader: {
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    listHeaderTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
        letterSpacing: 0.5,
    },
    // Playlist container styles
    playlistItemContainer: {
        marginBottom: 8,
    },
    playlistCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    playlistInfoRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    artworkContainer: {
        position: 'relative',
    },
    playlistArtwork: {
        width: 64,
        height: 64,
        borderRadius: 10,
        backgroundColor: '#1A1A1A',
    },
    playlistArtworkFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    songCountBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.green,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    songCountText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    playlistInfo: {
        flex: 1,
        marginLeft: 16
    },
    playlistName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4
    },
    playlistMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playlistMeta: {
        fontSize: 12,
        color: '#666',
        fontWeight: '400',
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#444',
        marginHorizontal: 6,
    },
    playingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    playButtonActive: {
        backgroundColor: colors.green,
        borderColor: colors.green,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        marginLeft: 80,
        marginVertical: 4,
    },
    // Songs list styles
    songsContainer: {
        marginTop: 8,
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        overflow: 'hidden',
        marginLeft: 4,
        marginRight: 4,
    },
    songsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    songsHeaderTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    songsHeaderCount: {
        fontSize: 12,
        color: '#666',
    },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.02)',
    },
    songRowActive: {
        backgroundColor: 'rgba(29,185,84,0.06)',
        borderRadius: 8,
    },
    songNumberContainer: {
        width: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    songNumber: {
        color: '#555',
        fontSize: 14,
        fontWeight: '500'
    },
    activeSongIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 16,
        gap: 2,
    },
    waveBar: {
        width: 3,
        height: 10,
        backgroundColor: colors.green,
        borderRadius: 2,
    },
    waveBar2: {
        height: 14,
    },
    waveBar3: {
        height: 8,
    },
    songArtwork: {
        width: 40,
        height: 40,
        borderRadius: 6,
        marginLeft: 4,
        marginRight: 12,
        backgroundColor: '#1A1A1A'
    },
    songArtworkActive: {
        borderWidth: 2,
        borderColor: colors.green,
    },
    songInfo: {
        flex: 1
    },
    songTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2
    },
    songTitleActive: {
        color: colors.green
    },
    nowPlayingText: {
        fontSize: 12,
        color: colors.green,
        fontWeight: '400',
    },
    songArtist: {
        color: '#666',
        fontSize: 12
    },
    songDuration: {
        color: '#555',
        fontSize: 13
    },
    emptySongsContainer: {
        paddingVertical: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 16,
        marginLeft: 4,
        marginRight: 4,
        gap: 8,
    },
    emptySongsText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 4,
    },
    addSongButton: {
        backgroundColor: 'rgba(29,185,84,0.12)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(29,185,84,0.2)',
    },
    addSongButtonText: {
        color: colors.green,
        fontSize: 14,
        fontWeight: '600',
    },
    // Empty state for no playlists
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: -60,
    },
    emptyIconContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    emptyIconOverlay: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#0A0A0A',
        borderRadius: 20,
        padding: 4,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        gap: 6,
    },
    footerNoteText: {
        color: '#444',
        fontSize: 12
    },
});

export default UserPlaylistsScreen;