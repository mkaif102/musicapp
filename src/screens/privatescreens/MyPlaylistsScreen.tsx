import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { State, usePlaybackState, useActiveTrack } from 'react-native-track-player';
import { colors } from '../../theme/Colors';
import { saveToRecentlyPlayed } from '../../utils/recentlyPlayed';
import { searchSongsByName } from '../../services/jiosaavn';
import { parseDuration, getAllSongs, getSongsByGenre, getSongsByMood } from '../../data/songs';
import type { Song } from '../../data/songs';
import { useMiniPlayerHeight } from '../../hooks/useMiniPlayerHeight';
import {
    getCustomPlaylists,
    createCustomPlaylist,
    addSongsToPlaylist,
    deleteCustomPlaylist,
    type CustomPlaylist,
    type CustomPlaylistSong,
} from '../../utils/customPlaylists';
import { getOfflineUrl, downloadSong } from '../../utils/offlineCache';

const { width } = Dimensions.get('window');

const MyPlaylistsScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [songsModalVisible, setSongsModalVisible] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;
    const miniPlayerHeight = useMiniPlayerHeight();

    const [customPlaylists, setCustomPlaylists] = useState<CustomPlaylist[]>([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [addSongsModalVisible, setAddSongsModalVisible] = useState(false);
    const [newlyCreatedPlaylist, setNewlyCreatedPlaylist] = useState<CustomPlaylist | null>(null);
    const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
    const [addSongSearchQuery, setAddSongSearchQuery] = useState('');
    const [allAvailableSongs, setAllAvailableSongs] = useState<Song[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [addSongApiResults, setAddSongApiResults] = useState<Song[]>([]);
    const [addSongApiLoading, setAddSongApiLoading] = useState(false);
    const addSongDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // NEW: State for folder detail view
    const [folderDetailVisible, setFolderDetailVisible] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);

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

    const loadCustomPlaylists = async () => {
        const playlists = await getCustomPlaylists();
        setCustomPlaylists(playlists);
    };

    useEffect(() => {
        loadCustomPlaylists();
        return () => {
            if (addSongDebounceRef.current) clearTimeout(addSongDebounceRef.current);
        };
    }, []);

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

            const uniqueSongs = new Map<string, Song>();
            [...local, ...apiTopHits, ...apiElectronic, ...apiChill, ...apiWorkout, ...apiTrending,
            ...apiArijit, ...apiTalha, ...apiHasan, ...apiTalwinder, ...apiKK].forEach(s => {
                if (!uniqueSongs.has(s.id)) {
                    uniqueSongs.set(s.id, s);
                }
            });
            setAllAvailableSongs(Array.from(uniqueSongs.values()));
            setLoading(false);
        };
        loadAllSongs();
    }, []);

    function calculateTotalDuration(songs: { duration: string }[]): string {
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
        const builtin = [
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

        const custom = customPlaylists.map(cp => ({
            id: cp.id,
            name: cp.name,
            songCount: cp.songs.length,
            duration: calculateTotalDuration(cp.songs),
            color: cp.color,
            isPublic: false,
            likes: 0,
            description: cp.songs.length > 0 ? `${cp.songs.length} songs by you` : 'Tap + to add songs',
            isCustom: true,
            customPlaylist: cp,
        }));

        return [...custom, ...builtin];
    }, [topHitsSongs, electronicSongs, chillSongs, workoutSongs, trendingSongs, allLocalSongs, arijitSongs, talhaSongs, hasanSongs, talwinderSongs, kkSongs, customPlaylists]);

    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Public', 'Private', 'Most Liked'];

    const handleCreatePlaylist = () => {
        setNewPlaylistName('');
        setCreateModalVisible(true);
    };

    const handleCreatePlaylistConfirm = async () => {
        const name = newPlaylistName.trim();
        if (!name) {
            Alert.alert('Error', 'Please enter a playlist name.');
            return;
        }
        const duplicate = playlists.some(p => p.name.toLowerCase() === name.toLowerCase());
        if (duplicate) {
            Alert.alert('Error', 'A playlist with this name already exists.');
            return;
        }
        const playlist = await createCustomPlaylist(name);
        await loadCustomPlaylists();
        setCreateModalVisible(false);
        setNewlyCreatedPlaylist(playlist);
        setSelectedSongIds(new Set());
        setAddSongSearchQuery('');
        setAddSongsModalVisible(true);
    };

    const toggleSongSelection = (songId: string) => {
        setSelectedSongIds(prev => {
            const next = new Set(prev);
            if (next.has(songId)) {
                next.delete(songId);
            } else {
                next.add(songId);
            }
            return next;
        });
    };

    const handleSaveSelectedSongs = async () => {
        if (!newlyCreatedPlaylist) return;
        if (selectedSongIds.size === 0) {
            Alert.alert('No songs selected', 'Select at least one song to add.');
            return;
        }
        setIsSaving(true);
        try {
            const allSongsForLookup = new Map<string, Song>();
            allAvailableSongs.forEach(s => allSongsForLookup.set(s.id, s));
            addSongApiResults.forEach(s => {
                if (!allSongsForLookup.has(s.id)) allSongsForLookup.set(s.id, s);
            });

            const songs: CustomPlaylistSong[] = Array.from(selectedSongIds)
                .map(id => allSongsForLookup.get(id))
                .filter((s): s is Song => s !== undefined)
                .map(s => ({
                    id: s.id,
                    title: s.title,
                    artist: s.artist,
                    artwork: s.artwork || 'https://picsum.photos/seed/song/400',
                    duration: s.duration,
                    url: s.url,
                    album: s.album,
                }));
            await addSongsToPlaylist(newlyCreatedPlaylist.id, songs);
            await loadCustomPlaylists();
            setAddSongsModalVisible(false);

            // Close folder detail if open
            if (folderDetailVisible) {
                // Refresh the folder detail view
                const updatedPlaylist = customPlaylists.find(p => p.id === newlyCreatedPlaylist.id);
                if (updatedPlaylist) {
                    setSelectedFolder({
                        ...selectedFolder,
                        customPlaylist: updatedPlaylist,
                        songCount: updatedPlaylist.songs.length,
                        duration: calculateTotalDuration(updatedPlaylist.songs),
                        description: updatedPlaylist.songs.length > 0 ? `${updatedPlaylist.songs.length} songs by you` : 'Tap + to add songs',
                    });
                }
            }

            // Alert.alert('Done!', `${songs.length} songs added to "${newlyCreatedPlaylist.name}"`);
            songs.forEach(s => {
                downloadSong(s.id, s.url);
            });
        } catch {
            Alert.alert('Error', 'Failed to add songs.');
        }
        setIsSaving(false);
    };

    // UPDATED: Handle add songs to existing playlist
    const handleAddSongsToExisting = (playlist: any) => {
        if (!playlist.isCustom) return;
        setNewlyCreatedPlaylist(playlist.customPlaylist);
        setSelectedSongIds(new Set());
        setAddSongSearchQuery('');
        setAddSongApiResults([]);
        setAddSongsModalVisible(true);
    };

    const fetchAddSongApiSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setAddSongApiResults([]);
            return;
        }
        try {
            setAddSongApiLoading(true);
            const results = await searchSongsByName(query, 20);
            setAddSongApiResults(results as Song[]);
        } catch {
            setAddSongApiResults([]);
        } finally {
            setAddSongApiLoading(false);
        }
    }, []);

    const handleAddSongSearchChange = (text: string) => {
        setAddSongSearchQuery(text);
        if (addSongDebounceRef.current) clearTimeout(addSongDebounceRef.current);
        addSongDebounceRef.current = setTimeout(() => {
            fetchAddSongApiSearch(text);
        }, 500);
    };

    const handleDeleteCustomPlaylist = (playlist: any) => {
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
                        await loadCustomPlaylists();
                        if (folderDetailVisible) {
                            setFolderDetailVisible(false);
                            setSelectedFolder(null);
                        }
                    },
                },
            ],
        );
    };

    const filteredAddSongs = useMemo(() => {
        const query = addSongSearchQuery.trim();
        if (!query) return allAvailableSongs;

        const q = query.toLowerCase();
        const localMatches = allAvailableSongs.filter(
            s => s.title.toLowerCase().includes(q) ||
                s.artist.toLowerCase().includes(q) ||
                s.album.toLowerCase().includes(q)
        );

        const apiIds = new Set(localMatches.map(s => s.id));
        const apiOnly = addSongApiResults.filter(s => !apiIds.has(s.id));

        return [...localMatches, ...apiOnly];
    }, [allAvailableSongs, addSongSearchQuery, addSongApiResults]);

    const playPlaylist = async (playlist: any) => {
        let songs: Song[] = [];

        if (playlist.isCustom && playlist.customPlaylist) {
            songs = playlist.customPlaylist.songs.map((s: any) => ({
                ...s,
                artwork: s.artwork || 'https://picsum.photos/seed/song/400',
            }));
        } else {
            songs = songLibrary[playlist.name] || [];
        }

        if (!songs || songs.length === 0) {
            Alert.alert('No Songs', 'This playlist has no songs to play yet.');
            return;
        }
        try {
            const tracks = await Promise.all(songs.map(async (s: any) => ({
                id: s.id,
                url: await getOfflineUrl(s.id, s.url),
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: parseDuration(s.duration),
                artwork: s.artwork,
            })));

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

    const playSingleSong = async (song: any, songs: any[]) => {
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

            const tracks = await Promise.all(songs.map(async (s: any) => ({
                id: s.id,
                url: await getOfflineUrl(s.id, s.url),
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: parseDuration(s.duration),
                artwork: s.artwork,
            })));

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

    // NEW: Handle folder press - open detail view
    const handleFolderPress = (playlist: any) => {
        if (playlist.isCustom) {
            setSelectedFolder(playlist);
            setFolderDetailVisible(true);
        } else {
            // For built-in playlists, open the existing modal
            setCurrentPlaylist(playlist);
            setSongsModalVisible(true);
        }
    };

    // NEW: Handle add songs from folder detail
    const handleAddSongsFromDetail = () => {
        if (selectedFolder && selectedFolder.isCustom) {
            handleAddSongsToExisting(selectedFolder);
        }
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
        let songs: any[] = [];
        if (item.isCustom && item.customPlaylist) {
            songs = item.customPlaylist.songs;
        } else {
            songs = songLibrary[item.name] || [];
        }
        const firstSongArtwork = songs[0]?.artwork;
        const isCurrentPlaylist = currentPlaylist?.id === item.id && activeTrack;

        return (
            <TouchableOpacity
                style={styles.playlistCard}
                onPress={() => handleFolderPress(item)} // UPDATED: Use new handler
                onLongPress={() => item.isCustom ? handleDeleteCustomPlaylist(item) : undefined}
                activeOpacity={0.7}
            >
                {firstSongArtwork ? (
                    <Image source={{ uri: firstSongArtwork }} style={styles.playlistArtwork} />
                ) : (
                    <View style={[styles.playlistArtwork, styles.playlistArtworkFallback, { backgroundColor: item.color + '22' }]}>
                        <Icon name={item.isCustom ? 'folder-open' : 'musical-notes'} size={24} color={item.color || '#1DB954'} />
                    </View>
                )}

                <View style={styles.playlistInfo}>
                    <View style={styles.playlistNameRow}>
                        <Text style={styles.playlistName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        {item.isCustom && (
                            <View style={styles.customBadge}>
                                <Text style={styles.customBadgeText}>YOURS</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.playlistMeta}>
                        {item.description} · {item.songCount} tracks
                    </Text>
                    <View style={styles.playlistStats}>
                        <Icon name="heart" size={12} color="#999" />
                        <Text style={styles.playlistLikes}>{item.likes || 0}</Text>
                        <Text style={styles.playlistDot}>·</Text>
                        <Text style={styles.playlistDuration}>{item.duration}</Text>
                    </View>
                </View>

                {item.isCustom ? (
                    <TouchableOpacity
                        style={styles.addSongButton}
                        onPress={(e) => {
                            e.stopPropagation(); // Prevent folder press
                            handleAddSongsToExisting(item);
                        }}
                    >
                        <Icon name="add" size={18} color="#1DB954" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.playButton, isCurrentPlaylist && styles.playButtonActive]}
                        onPress={(e) => {
                            e.stopPropagation(); // Prevent folder press
                            playPlaylist(item);
                        }}
                    >
                        <Icon
                            name={isCurrentPlaylist && isPlaying ? 'pause' : 'play'}
                            size={18}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const filteredPlaylists = getFilteredPlaylists();

    const getPlaylistSongs = (): Song[] => {
        if (!currentPlaylist) return [];
        if (currentPlaylist.isCustom && currentPlaylist.customPlaylist) {
            return currentPlaylist.customPlaylist.songs;
        }
        return songLibrary[currentPlaylist.name] || [];
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

            <View style={styles.container}>
                <View style={styles.header}>
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
                        contentContainerStyle={[styles.playlistsList, { paddingBottom: 100 + miniPlayerHeight }]}
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

                {/* Existing Songs Modal (for built-in playlists) */}
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
                                data={getPlaylistSongs()}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item, index }) => {
                                    const isActive = activeTrack?.id === item.id;
                                    const songs = getPlaylistSongs();
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

                {/* NEW: Folder Detail Modal */}
                <Modal
                    visible={folderDetailVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => {
                        setFolderDetailVisible(false);
                        setSelectedFolder(null);
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHandle} />

                            <View style={styles.modalHeader}>
                                <View style={styles.modalHeaderInfo}>
                                    <Text style={styles.modalTitle}>
                                        {selectedFolder?.name}
                                    </Text>
                                    <Text style={styles.modalSubtitle}>
                                        {selectedFolder?.description} · {selectedFolder?.songCount} tracks
                                    </Text>
                                </View>
                                <View style={styles.modalHeaderActions}>
                                    {/* Add Songs Button in Header */}
                                    <TouchableOpacity
                                        style={[styles.modalCloseBtn, styles.modalAddBtn]}
                                        onPress={handleAddSongsFromDetail}
                                    >
                                        <Icon name="add" size={20} color="#1DB954" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setFolderDetailVisible(false);
                                            setSelectedFolder(null);
                                        }}
                                        style={styles.modalCloseBtn}
                                    >
                                        <Icon name="close" size={22} color="#999" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Play All Button */}
                            <TouchableOpacity
                                style={styles.modalPlayAllBtn}
                                onPress={() => {
                                    if (selectedFolder) playPlaylist(selectedFolder);
                                }}
                            >
                                <Icon
                                    name={isPlaying && selectedFolder ? 'pause' : 'play'}
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.modalPlayAllText}>
                                    {isPlaying && selectedFolder ? 'Pause' : 'Play All'}
                                </Text>
                            </TouchableOpacity>

                            {/* Add Songs Button Below Play All */}
                            <TouchableOpacity
                                style={[styles.modalPlayAllBtn, styles.addSongsBtn]}
                                onPress={handleAddSongsFromDetail}
                            >
                                <Icon name="add-circle-outline" size={20} color="#1DB954" />
                                <Text style={[styles.modalPlayAllText, styles.addSongsBtnText]}>
                                    Add Songs to Playlist
                                </Text>
                            </TouchableOpacity>

                            {/* Songs List */}
                            <FlatList
                                data={selectedFolder?.customPlaylist?.songs || []}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item, index }) => {
                                    const isActive = activeTrack?.id === item.id;
                                    const songs = selectedFolder?.customPlaylist?.songs || [];
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
                                        <Icon name="musical-notes-outline" size={32} color="#333" />
                                        <Text style={styles.emptySongsText}>
                                            No songs in this playlist yet.
                                        </Text>
                                        <Text style={styles.emptySongsSubtext}>
                                            Tap the + button to add songs
                                        </Text>
                                    </View>
                                }
                            />
                        </View>
                    </View>
                </Modal>

                {/* Step 1: Create Playlist Modal */}
                <Modal
                    visible={createModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setCreateModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <View style={styles.createModalContent}>
                            <View style={styles.modalHandle} />
                            <View style={styles.createModalHeader}>
                                <Text style={styles.createModalTitle}>New Playlist</Text>
                                <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={styles.modalCloseBtn}>
                                    <Icon name="close" size={22} color="#999" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.createModalLabel}>Give your playlist a name</Text>
                            <View style={styles.createInputWrapper}>
                                <Icon name="musical-note" size={18} color="#1DB954" />
                                <TextInput
                                    style={styles.createInput}
                                    placeholder="My Playlist"
                                    placeholderTextColor="#555"
                                    value={newPlaylistName}
                                    onChangeText={setNewPlaylistName}
                                    autoFocus
                                    onSubmitEditing={handleCreatePlaylistConfirm}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.createConfirmBtn, !newPlaylistName.trim() && styles.createConfirmBtnDisabled]}
                                onPress={handleCreatePlaylistConfirm}
                                disabled={!newPlaylistName.trim()}
                                activeOpacity={0.7}
                            >
                                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
                                <Text style={styles.createConfirmBtnText}>Next: Add Songs</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Step 2: Add Songs Modal */}
                <Modal
                    visible={addSongsModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setAddSongsModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <View style={styles.addSongsModalContent}>
                            <View style={styles.modalHandle} />
                            <View style={styles.addSongsHeader}>
                                <View style={styles.addSongsHeaderInfo}>
                                    <Text style={styles.addSongsTitle}>Add Songs</Text>
                                    <Text style={styles.addSongsSubtitle}>
                                        to "{newlyCreatedPlaylist?.name}"
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setAddSongsModalVisible(false)} style={styles.modalCloseBtn}>
                                    <Icon name="close" size={22} color="#999" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.addSongSearchContainer}>
                                <Icon name="search-outline" size={16} color="#777" />
                                <TextInput
                                    style={styles.addSongSearchInput}
                                    placeholder="Search songs..."
                                    placeholderTextColor="#555"
                                    value={addSongSearchQuery}
                                    onChangeText={handleAddSongSearchChange}
                                />
                                {addSongSearchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setAddSongSearchQuery('')}>
                                        <Icon name="close-circle" size={16} color="#555" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {addSongApiLoading && (
                                <View style={styles.addSongApiLoading}>
                                    <ActivityIndicator size="small" color="#1DB954" />
                                    <Text style={styles.addSongApiLoadingText}>Searching online...</Text>
                                </View>
                            )}

                            {selectedSongIds.size > 0 && (
                                <View style={styles.selectedCountBar}>
                                    <Icon name="checkmark-circle" size={16} color="#1DB954" />
                                    <Text style={styles.selectedCountText}>
                                        {selectedSongIds.size} song{selectedSongIds.size !== 1 ? 's' : ''} selected
                                    </Text>
                                </View>
                            )}

                            <FlatList
                                data={filteredAddSongs}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    const isSelected = selectedSongIds.has(item.id);
                                    return (
                                        <TouchableOpacity
                                            style={[styles.addSongRow, isSelected && styles.addSongRowSelected]}
                                            onPress={() => toggleSongSelection(item.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Image source={{ uri: item.artwork || 'https://picsum.photos/seed/song/400' }} style={styles.addSongArtwork} />
                                            <View style={styles.addSongInfo}>
                                                <Text style={[styles.addSongTitle, isSelected && styles.addSongTitleSelected]} numberOfLines={1}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.addSongArtist} numberOfLines={1}>
                                                    {item.artist}
                                                </Text>
                                            </View>
                                            <View style={[styles.addSongCheckbox, isSelected && styles.addSongCheckboxSelected]}>
                                                {isSelected && <Icon name="checkmark" size={14} color="#FFFFFF" />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                                ItemSeparatorComponent={() => <View style={styles.songDivider} />}
                                ListEmptyComponent={
                                    <View style={styles.emptySongsContainer}>
                                        <Icon name="search-outline" size={32} color="#333" />
                                        <Text style={styles.emptySongsText}>
                                            {addSongSearchQuery ? 'No songs match your search' : 'No songs available'}
                                        </Text>
                                    </View>
                                }
                            />

                            <TouchableOpacity
                                style={[styles.saveSongsBtn, (selectedSongIds.size === 0 || isSaving) && styles.saveSongsBtnDisabled]}
                                onPress={handleSaveSelectedSongs}
                                disabled={selectedSongIds.size === 0 || isSaving}
                                activeOpacity={0.7}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Icon name="checkmark-circle" size={20} color="#FFFFFF" />
                                        <Text style={styles.saveSongsBtnText}>
                                            Save {selectedSongIds.size} Song{selectedSongIds.size !== 1 ? 's' : ''}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
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
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
        flex: 1,
        textAlign: 'left',
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
    modalHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
    modalAddBtn: {
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        borderWidth: 1,
        borderColor: '#1DB954',
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
    addSongsBtn: {
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        borderWidth: 1,
        borderColor: '#1DB954',
        marginBottom: 8,
    },
    addSongsBtnText: {
        color: '#1DB954',
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
        marginTop: 8,
    },
    emptySongsSubtext: {
        color: '#555',
        fontSize: 12,
        marginTop: 4,
    },

    playlistNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 3,
    },
    customBadge: {
        backgroundColor: colors.green,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    customBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    addSongButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },

    createModalContent: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
        paddingTop: 10,
    },
    createModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    createModalTitle: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '800',
    },
    createModalLabel: {
        color: '#888',
        fontSize: 14,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    createInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        paddingHorizontal: 14,
        marginHorizontal: 20,
        marginBottom: 20,
        height: 48,
        gap: 10,
    },
    createInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        padding: 0,
    },
    createConfirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.green,
        paddingVertical: 14,
        marginHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    createConfirmBtnDisabled: {
        opacity: 0.4,
    },
    createConfirmBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    addSongsModalContent: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
        maxHeight: '90%',
        minHeight: '70%',
    },
    addSongsHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    addSongsHeaderInfo: {
        flex: 1,
    },
    addSongsTitle: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 2,
    },
    addSongsSubtitle: {
        color: '#888',
        fontSize: 13,
    },
    addSongSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        borderRadius: 10,
        paddingHorizontal: 14,
        marginHorizontal: 20,
        marginBottom: 8,
        height: 40,
        gap: 8,
    },
    addSongSearchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        padding: 0,
    },
    selectedCountBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 6,
    },
    selectedCountText: {
        color: '#1DB954',
        fontSize: 13,
        fontWeight: '600',
    },
    addSongRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    addSongRowSelected: {
        backgroundColor: 'rgba(29, 185, 84, 0.08)',
    },
    addSongArtwork: {
        width: 42,
        height: 42,
        borderRadius: 4,
        backgroundColor: '#1A1A1A',
    },
    addSongInfo: {
        flex: 1,
        marginLeft: 12,
    },
    addSongTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    addSongTitleSelected: {
        color: '#1DB954',
    },
    addSongArtist: {
        color: '#888',
        fontSize: 12,
    },
    addSongCheckbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addSongCheckboxSelected: {
        backgroundColor: '#1DB954',
        borderColor: '#1DB954',
    },
    saveSongsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.green,
        paddingVertical: 14,
        marginHorizontal: 20,
        marginTop: 8,
        borderRadius: 12,
        gap: 8,
    },
    saveSongsBtnDisabled: {
        opacity: 0.4,
    },
    saveSongsBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    addSongApiLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 6,
        gap: 8,
    },
    addSongApiLoadingText: {
        color: '#888',
        fontSize: 12,
    },
});

export default MyPlaylistsScreen;