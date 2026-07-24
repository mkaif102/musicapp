import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    TextInput,
    FlatList,
    Alert,
    Modal,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { State, usePlaybackState, useActiveTrack } from 'react-native-track-player';
import { colors } from '../../theme/Colors';
import { useFocusEffect } from '@react-navigation/native';
import { saveToRecentlyPlayed } from '../../utils/recentlyPlayed';
import { searchSongsByName } from '../../services/jiosaavn';
import { parseDuration, getAllSongs, getSongsByGenre, getSongsByMood } from '../../data/songs';
import type { Song } from '../../data/songs';

const { width } = Dimensions.get('window');

const MyPlaylistsScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [songsModalVisible, setSongsModalVisible] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;

    const [allLocalSongs, setAllLocalSongs] = useState<Song[]>([]);
    const [topHitsSongs, setTopHitsSongs] = useState<Song[]>([]);
    const [electronicSongs, setElectronicSongs] = useState<Song[]>([]);
    const [chillSongs, setChillSongs] = useState<Song[]>([]);
    const [workoutSongs, setWorkoutSongs] = useState<Song[]>([]);
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [arijitSongs, setArijitSongs] = useState<Song[]>([]);
    const [talhaSongs, setTalhaSongs] = useState<Song[]>([]);
    const [hasanSongs, setHasanSongs] = useState<Song[]>([]);
    const [talwinderSongs, setTalwinderSongs] = useState<Song[]>([]);
    const [kkSongs, setKkSongs] = useState<Song[]>([]);

    useEffect(() => {
        const loadAllSongs = async () => {
            setLoading(true);
            const local = getAllSongs();
            setAllLocalSongs(local);

            const [apiTopHits, apiElectronic, apiChill, apiWorkout, apiTrending] = await Promise.all([
                searchSongsByName('top hits', 10),
                searchSongsByName('electronic', 10),
                searchSongsByName('chill', 10),
                searchSongsByName('workout', 10),
                searchSongsByName('popular', 10),
            ]);

            setTopHitsSongs(apiTopHits.length > 0 ? apiTopHits : local);
            setElectronicSongs(apiElectronic.length > 0 ? apiElectronic : getSongsByGenre('Electronic'));
            setChillSongs(apiChill.length > 0 ? apiChill : [...getSongsByGenre('Ambient'), ...getSongsByGenre('Lofi')]);
            setWorkoutSongs(apiWorkout.length > 0 ? apiWorkout : getSongsByMood('Energizing'));
            setTrendingSongs(apiTrending.length > 0 ? apiTrending : local.slice(0, 10));
            const [apiArijit, apiTalha, apiHasan, apiTalwinder, apiKK] = await Promise.all([
                searchSongsByName('Arijit Singh', 10),
                searchSongsByName('Talha Anjum', 10),
                searchSongsByName('Hasan Raheem', 10),
                searchSongsByName('Talwinder', 10),
                searchSongsByName('KK singer', 10),
            ]);
            setArijitSongs(apiArijit.length > 0 ? apiArijit : []);
            setTalhaSongs(apiTalha.length > 0 ? apiTalha : []);
            setHasanSongs(apiHasan.length > 0 ? apiHasan : []);
            setTalwinderSongs(apiTalwinder.length > 0 ? apiTalwinder : []);
            setKkSongs(apiKK.length > 0 ? apiKK : []);
            setLoading(false);
        };
        loadAllSongs();
    }, []);

    function calculateTotalDuration(songs: Song[]): string {
        let totalSeconds = 0;
        songs.forEach(song => {
            const parts = song.duration.split(':').map(Number);
            if (parts.length === 2) {
                totalSeconds += parts[0] * 60 + parts[1];
            } else if (parts.length === 3) {
                totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
        });
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}min`;
        return `${minutes}min`;
    }

    const songLibrary: { [key: string]: Song[] } = useMemo(() => {
        return {
            'Top Hits': topHitsSongs,
            'Electronic Vibes': electronicSongs,
            'Chill & Relax': chillSongs,
            'Workout Energy': workoutSongs,
            'Recently Played': trendingSongs,
            'All Songs': allLocalSongs,
            'Arijit Singh': arijitSongs,
            'Talha Anjum': talhaSongs,
            'Hasan Raheem': hasanSongs,
            'Talwinder': talwinderSongs,
            'KK': kkSongs,
        };
    }, [topHitsSongs, electronicSongs, chillSongs, workoutSongs, trendingSongs, allLocalSongs, arijitSongs, talhaSongs, hasanSongs, talwinderSongs, kkSongs]);

    const playlists = useMemo(() => {
        return [
            {
                id: '1',
                name: 'Top Hits',
                songCount: topHitsSongs.length,
                duration: calculateTotalDuration(topHitsSongs),
                color: '#1DB954',
                isPublic: true,
                likes: 1247,
                description: 'Top tracks from JioSaavn',
            },
            {
                id: '2',
                name: 'Arijit Singh',
                songCount: arijitSongs.length,
                duration: calculateTotalDuration(arijitSongs),
                color: '#FF6B6B',
                isPublic: true,
                likes: 2500,
                description: 'Romantic hits by Arijit Singh',
            },
            {
                id: '3',
                name: 'Talha Anjum',
                songCount: talhaSongs.length,
                duration: calculateTotalDuration(talhaSongs),
                color: '#6C63FF',
                isPublic: true,
                likes: 1800,
                description: 'Hip-hop bars by Talha Anjum',
            },
            {
                id: '4',
                name: 'Hasan Raheem',
                songCount: hasanSongs.length,
                duration: calculateTotalDuration(hasanSongs),
                color: '#4ECDC4',
                isPublic: true,
                likes: 1600,
                description: 'Smooth pop by Hasan Raheem',
            },
            {
                id: '5',
                name: 'Talwinder',
                songCount: talwinderSongs.length,
                duration: calculateTotalDuration(talwinderSongs),
                color: '#FFA07A',
                isPublic: true,
                likes: 1400,
                description: 'Vibes by Talwinder',
            },
            {
                id: '6',
                name: 'KK',
                songCount: kkSongs.length,
                duration: calculateTotalDuration(kkSongs),
                color: '#FFD93D',
                isPublic: true,
                likes: 3000,
                description: 'Legendary hits by KK',
            },
            {
                id: '7',
                name: 'Electronic Vibes',
                songCount: electronicSongs.length,
                duration: calculateTotalDuration(electronicSongs),
                color: '#1DB954',
                isPublic: true,
                likes: 892,
                description: 'Best electronic & synth tracks',
            },
            {
                id: '8',
                name: 'Chill & Relax',
                songCount: chillSongs.length,
                duration: calculateTotalDuration(chillSongs),
                color: '#4ECDC4',
                isPublic: true,
                likes: 1567,
                description: 'Ambient & lofi for relaxation',
            },
            {
                id: '9',
                name: 'Workout Energy',
                songCount: workoutSongs.length,
                duration: calculateTotalDuration(workoutSongs),
                color: '#FF6B6B',
                isPublic: true,
                likes: 734,
                description: 'High-energy tracks to fuel your workout',
            },
            {
                id: '10',
                name: 'Recently Played',
                songCount: trendingSongs.length,
                duration: calculateTotalDuration(trendingSongs),
                color: '#FFA07A',
                isPublic: false,
                likes: 523,
                description: 'Your recently played tracks',
            },
            {
                id: '11',
                name: 'All Songs',
                songCount: allLocalSongs.length,
                duration: calculateTotalDuration(allLocalSongs),
                color: '#FFD93D',
                isPublic: false,
                likes: 345,
                description: 'Full song library',
            },
        ];
    }, [topHitsSongs, electronicSongs, chillSongs, workoutSongs, trendingSongs, allLocalSongs, arijitSongs, talhaSongs, hasanSongs, talwinderSongs, kkSongs]);

    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Public', 'Private', 'Most Liked'];

    const handleCreatePlaylist = () => {
        Alert.alert(
            'Create Playlist',
            'Enter playlist name:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Create',
                    onPress: () => {
                        Alert.alert('Success', 'Playlist created successfully!');
                    },
                },
            ],
        );
    };

    const playPlaylist = async (playlist: any) => {
        const songs = songLibrary[playlist.name];
        if (!songs || songs.length === 0) {
            Alert.alert('No Songs', 'This playlist has no songs to play yet.');
            return;
        }
        try {
            const tracks = songs.map((s: Song) => ({
                id: s.id,
                url: s.url,
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: parseDuration(s.duration),
                artwork: s.artwork,
            }));

            const currentActiveTrack = await TrackPlayer.getActiveTrack();
            if (currentActiveTrack && currentActiveTrack.id === tracks[0].id) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
                return;
            }

            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
            setSongsModalVisible(false);
        } catch (error) {
            console.log('Playlist playback error:', error);
        }
    };

    const playSingleSong = async (song: Song, songs: Song[]) => {
        try {
            const currentActiveTrack = await TrackPlayer.getActiveTrack();
            if (currentActiveTrack && currentActiveTrack.id === song.id) {
                if (isPlaying) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
                return;
            }

            const tracks = songs.map((s: Song) => ({
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
            if (songIndex >= 0) {
                await TrackPlayer.skip(songIndex);
            }
            await TrackPlayer.play();
            saveToRecentlyPlayed({
                id: song.id,
                title: song.title,
                artist: song.artist,
                album: song.album,
                duration: song.duration,
                url: song.url,
                artwork: song.artwork || 'https://picsum.photos/seed/song/400',
            });
        } catch (error) {
            console.log('Song playback error:', error);
        }
    };

    const handlePlaylistPress = (playlist: any) => {
        setCurrentPlaylist(playlist);
        setSongsModalVisible(true);
    };

    const getFilteredPlaylists = () => {
        let filtered = playlists;

        if (searchQuery.trim()) {
            filtered = filtered.filter(playlist =>
                playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedFilter === 'Public') {
            filtered = filtered.filter(playlist => playlist.isPublic);
        } else if (selectedFilter === 'Private') {
            filtered = filtered.filter(playlist => !playlist.isPublic);
        } else if (selectedFilter === 'Most Liked') {
            filtered = [...filtered].sort((a, b) => b.likes - a.likes);
        }

        return filtered;
    };

    const renderPlaylistItem = ({ item }: { item: any }) => {
        const songs = songLibrary[item.name] || [];
        const firstSongArtwork = songs[0]?.artwork;
        const isCurrentPlaylist = currentPlaylist?.id === item.id && activeTrack;

        return (
            <TouchableOpacity
                style={styles.playlistCard}
                onPress={() => handlePlaylistPress(item)}
                activeOpacity={0.7}
            >
                {firstSongArtwork ? (
                    <Image source={{ uri: firstSongArtwork }} style={styles.playlistArtwork} />
                ) : (
                    <View style={[styles.playlistArtwork, styles.playlistArtworkFallback]}>
                        <Icon name="musical-notes" size={24} color="#1DB954" />
                    </View>
                )}

                <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.playlistMeta}>
                        {item.description} · {item.songCount} tracks
                    </Text>
                    <View style={styles.playlistStats}>
                        <Icon name="heart" size={12} color="#999" />
                        <Text style={styles.playlistLikes}>{item.likes}</Text>
                        <Text style={styles.playlistDot}>·</Text>
                        <Text style={styles.playlistDuration}>{item.duration}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.playButton, isCurrentPlaylist && styles.playButtonActive]}
                    onPress={() => playPlaylist(item)}
                >
                    <Icon
                        name={isCurrentPlaylist && isPlaying ? 'pause' : 'play'}
                        size={18}
                        color={isCurrentPlaylist && isPlaying ? '#FFFFFF' : '#FFFFFF'}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const filteredPlaylists = getFilteredPlaylists();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

            <View style={styles.container}>
                <View style={styles.header}>
                    {/* {navigation.canGoBack() && (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Icon name="arrow-back" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    )} */}
                    <Text style={styles.headerTitle}>Your Library</Text>
                    <TouchableOpacity style={styles.headerButton} onPress={handleCreatePlaylist}>
                        <Icon name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={18} color="#777" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search your library"
                        placeholderTextColor="#555"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={18} color="#555" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.filtersWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContent}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    selectedFilter === filter && styles.filterChipActive,
                                ]}
                                onPress={() => setSelectedFilter(filter)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        selectedFilter === filter && styles.filterTextActive,
                                    ]}
                                >
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1DB954" />
                        <Text style={styles.loadingText}>Loading tracks...</Text>
                    </View>
                ) : filteredPlaylists.length > 0 ? (
                    <FlatList
                        data={filteredPlaylists}
                        renderItem={renderPlaylistItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.playlistsList}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon name="musical-notes-outline" size={48} color="#333" />
                        <Text style={styles.emptyTitle}>No playlists found</Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery ? 'Try adjusting your search' : 'Create your first playlist'}
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={handleCreatePlaylist}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.emptyButtonText}>Create Playlist</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Modal
                    visible={songsModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setSongsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />

                            <View style={styles.modalHeader}>
                                <View style={styles.modalHeaderInfo}>
                                    <Text style={styles.modalTitle}>
                                        {currentPlaylist?.name}
                                    </Text>
                                    <Text style={styles.modalSubtitle}>
                                        {currentPlaylist?.description} · {currentPlaylist?.songCount} tracks
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setSongsModalVisible(false)} style={styles.modalCloseBtn}>
                                    <Icon name="close" size={22} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.modalPlayAllBtn}
                                onPress={() => {
                                    if (currentPlaylist) playPlaylist(currentPlaylist);
                                }}
                            >
                                <Icon
                                    name={isPlaying && currentPlaylist ? 'pause' : 'play'}
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.modalPlayAllText}>
                                    {isPlaying && currentPlaylist ? 'Pause' : 'Play All'}
                                </Text>
                            </TouchableOpacity>

                            <FlatList
                                data={currentPlaylist ? (songLibrary[currentPlaylist.name] || []) : []}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item, index }) => {
                                    const isActive = activeTrack?.id === item.id;
                                    const songs = currentPlaylist ? (songLibrary[currentPlaylist.name] || []) : [];
                                    return (
                                        <TouchableOpacity
                                            style={[styles.songRow, isActive && styles.songRowActive]}
                                            onPress={() => playSingleSong(item, songs)}
                                        >
                                            <View style={styles.songLeft}>
                                                {isActive && isPlaying ? (
                                                    <View style={styles.equalizer}>
                                                        <View style={[styles.eqBar, { height: 12 }]} />
                                                        <View style={[styles.eqBar, { height: 18 }]} />
                                                        <View style={[styles.eqBar, { height: 8 }]} />
                                                        <View style={[styles.eqBar, { height: 14 }]} />
                                                    </View>
                                                ) : (
                                                    <Text style={[styles.songNumber, isActive && styles.songNumberActive]}>
                                                        {index + 1}
                                                    </Text>
                                                )}
                                            </View>
                                            <Image source={{ uri: item.artwork }} style={styles.songArtwork} />
                                            <View style={styles.songInfo}>
                                                <Text style={[styles.songTitle, isActive && styles.songTitleActive]} numberOfLines={1}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.songArtist} numberOfLines={1}>
                                                    {item.artist}
                                                </Text>
                                            </View>
                                            <Text style={styles.songDuration}>{item.duration}</Text>
                                            <TouchableOpacity
                                                onPress={() => playSingleSong(item, songs)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                style={styles.songPlayBtn}
                                            >
                                                <Icon
                                                    name={isActive && isPlaying ? 'pause' : 'play'}
                                                    size={16}
                                                    color={isActive ? '#1DB954' : '#888'}
                                                />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    );
                                }}
                                ItemSeparatorComponent={() => <View style={styles.songDivider} />}
                                ListEmptyComponent={
                                    <View style={styles.emptySongsContainer}>
                                        <Text style={styles.emptySongsText}>
                                            No songs in this playlist yet.
                                        </Text>
                                    </View>
                                }
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
        flex: 1,
        textAlign: 'center',
    },
    headerButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        borderRadius: 10,
        paddingHorizontal: 14,
        marginHorizontal: 20,
        marginBottom: 14,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        padding: 0,
    },

    filtersWrapper: {
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    filtersContent: {
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
    },
    filterChipActive: {
        backgroundColor: colors.green,
    },
    filterText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },

    playlistsList: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    playlistCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    playlistArtwork: {
        width: 56,
        height: 56,
        borderRadius: 6,
        backgroundColor: '#1A1A1A',
    },
    playlistArtworkFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    playlistInfo: {
        flex: 1,
        marginLeft: 14,
    },
    playlistName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    playlistMeta: {
        fontSize: 13,
        color: '#888',
        marginBottom: 4,
    },
    playlistStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    playlistLikes: {
        fontSize: 12,
        color: '#999',
    },
    playlistDot: {
        fontSize: 12,
        color: '#555',
    },
    playlistDuration: {
        fontSize: 12,
        color: '#999',
    },
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonActive: {
        backgroundColor: colors.green,
    },

    separator: {
        height: 1,
        backgroundColor: '#1A1A1A',
        marginLeft: 70,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#666',
        marginTop: 12,
        fontSize: 14,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: colors.green,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 24,
    },
    emptyButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '700',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
        maxHeight: '85%',
        minHeight: '60%',
    },
    modalHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#333',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    modalHeaderInfo: {
        flex: 1,
    },
    modalTitle: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    modalSubtitle: {
        color: '#888',
        fontSize: 13,
    },
    modalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    modalPlayAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.green,
        paddingVertical: 12,
        marginHorizontal: 20,
        borderRadius: 6,
        marginBottom: 12,
        gap: 8,
    },
    modalPlayAllText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    songRowActive: {
        backgroundColor: 'rgba(255,85,0,0.08)',
    },
    songLeft: {
        width: 28,
        alignItems: 'center',
    },
    songNumber: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    songNumberActive: {
        color: colors.green,
    },
    equalizer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        height: 20,
    },
    eqBar: {
        width: 3,
        backgroundColor: colors.green,
        borderRadius: 1,
    },
    songArtwork: {
        width: 44,
        height: 44,
        borderRadius: 4,
        marginLeft: 8,
        marginRight: 12,
        backgroundColor: '#1A1A1A',
    },
    songInfo: {
        flex: 1,
    },
    songTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    songTitleActive: {
        color: colors.green,
    },
    songArtist: {
        color: '#888',
        fontSize: 13,
    },
    songDuration: {
        color: '#666',
        fontSize: 13,
        marginRight: 12,
    },
    songPlayBtn: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    songDivider: {
        height: 0,
    },

    emptySongsContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptySongsText: {
        color: '#666',
        fontSize: 14,
    },
});

export default MyPlaylistsScreen;
