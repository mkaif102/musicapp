import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    StatusBar,
    Alert,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getAllSongs,
    getSongsByArtist,
    getSongsByGenre,
    songToTrack,
    getUniqueArtists,
    getUniqueGenres,
    getSongByName,
} from '../../data/songs';
import { saveToRecentlyPlayed } from '../../utils/recentlyPlayed';
import { searchSongsByName } from '../../services/jiosaavn';

// Track shape returned from our service (matches Song interface)
interface ApiSong {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: string;
    url: string;
    artwork?: string;
}

const SearchScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [apiSearchResults, setApiSearchResults] = useState<ApiSong[]>([]);
    const [apiLoading, setApiLoading] = useState(false);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const allSongs = useMemo(() => {
        try { return getAllSongs() || []; } catch { return []; }
    }, []);

    const artists = useMemo(() => {
        try { return getUniqueArtists() || []; } catch { return []; }
    }, []);

    const genres = useMemo(() => {
        try { return getUniqueGenres() || []; } catch { return []; }
    }, []);

    const combinedResults = useMemo(() => {
        const apiItems = apiSearchResults.map((s) => ({ ...s, type: 'api_song' }));
        return [...apiItems, ...searchResults];
    }, [apiSearchResults, searchResults]);

    useEffect(() => {
        loadRecentSearches();
    }, []);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    useEffect(() => {
        saveRecentSearches();
    }, [recentSearches]);

    const loadRecentSearches = async () => {
        try {
            const saved = await AsyncStorage.getItem('recentSearches');
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        } catch (error) {
            console.log('Error loading recent searches:', error);
        }
    };

    const saveRecentSearches = async () => {
        try {
            await AsyncStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        } catch (error) {
            console.log('Error saving recent searches:', error);
        }
    };

    const performSearch = useCallback((query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const lowerQuery = query.toLowerCase();
        let results: any[] = [];

        const matchedSongs = allSongs
            .filter((s) => s.title.toLowerCase() === lowerQuery || s.artist.toLowerCase() === lowerQuery)
            .map((s) => ({ ...s, type: 'song' }));

        const matchedArtists = artists
            .filter((a) => a.name.toLowerCase() === lowerQuery)
            .map((a) => ({ id: a.name, name: a.name, songs: `${a.songCount} songs`, type: 'artist' }));

        const matchedPlaylists = genres
            .filter((g) => g.name.toLowerCase() === lowerQuery)
            .map((g) => ({ id: g.name, title: `${g.name} Hits`, songs: `${g.songCount} songs`, type: 'playlist' }));

        if (activeTab === 'All') {
            results = [...matchedSongs, ...matchedArtists, ...matchedPlaylists];
        } else if (activeTab === 'Songs') {
            results = matchedSongs;
        } else if (activeTab === 'Artists') {
            results = matchedArtists;
        } else if (activeTab === 'Playlists') {
            results = matchedPlaylists;
        }

        setSearchResults(results);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchApiSearch(query);
        }, 500);
    }, [allSongs, artists, genres, activeTab]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setApiSearchResults([]);
    };

    const saveToHistory = (query: string) => {
        if (query.trim() && !recentSearches.includes(query)) {
            setRecentSearches([query, ...recentSearches.slice(0, 9)]);
        }
    };

    const fetchApiSearch = async (query: string) => {
        if (!query.trim()) {
            setApiSearchResults([]);
            return;
        }
        try {
            setApiLoading(true);
            const results = await searchSongsByName(query, 20);
            setApiSearchResults(results as ApiSong[]);
        } catch (err) {
            console.log('JioSaavn search error:', err);
            setApiSearchResults([]);
        } finally {
            setApiLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const playSong = async (song: any, isApiSong: boolean = false) => {
        try {
            if (isApiSong) {
                if (currentPlayingId === song.id) {
                    if (isPlaying) {
                        await TrackPlayer.pause();
                        setIsPlaying(false);
                    } else {
                        await TrackPlayer.play();
                        setIsPlaying(true);
                    }
                    return;
                }

                const track = {
                    id: song.id,
                    url: song.url,
                    title: song.title,
                    artist: song.artist,
                    album: song.album || 'Unknown',
                    duration: song.duration,
                    artwork: song.artwork || 'https://picsum.photos/seed/music/300',
                };

                await TrackPlayer.reset();
                await TrackPlayer.add(track);
                await TrackPlayer.play();
                setCurrentPlayingId(song.id);
                setIsPlaying(true);
                saveToRecentlyPlayed({
                    id: song.id,
                    title: song.title,
                    artist: song.artist,
                    album: song.album || 'Unknown',
                    duration: song.duration,
                    url: song.url,
                    artwork: song.artwork || 'https://picsum.photos/seed/music/300',
                });
            } else {
                const fullSong = getSongByName(song.title);
                if (!fullSong) {
                    Alert.alert('Error', 'Could not play song.');
                    return;
                }
                const track = songToTrack(fullSong);
                await TrackPlayer.reset();
                await TrackPlayer.add(track);
                await TrackPlayer.play();
                saveToRecentlyPlayed({
                    id: fullSong.id,
                    title: fullSong.title,
                    artist: fullSong.artist,
                    album: fullSong.album,
                    duration: fullSong.duration,
                    url: fullSong.url,
                    artwork: fullSong.artwork || 'https://picsum.photos/seed/song/400',
                });
            }
        } catch (error: any) {
            if (error?.code === 'player_already_initialized' || error?.message?.includes('already')) {
                try {
                    await TrackPlayer.reset();
                    if (isApiSong) {
                        await TrackPlayer.add({
                            id: song.id,
                            url: song.url,
                            title: song.title,
                            artist: song.artist,
                            album: song.album || 'Unknown',
                            duration: song.duration,
                            artwork: song.artwork || 'https://picsum.photos/seed/music/300',
                        });
                        setCurrentPlayingId(song.id);
                    } else {
                        const fullSong = getSongByName(song.title);
                        if (fullSong) {
                            await TrackPlayer.add(songToTrack(fullSong));
                        }
                    }
                    await TrackPlayer.play();
                    if (isApiSong) setIsPlaying(true);
                } catch (innerError) {
                    console.log('Playback retry error:', innerError);
                }
            } else {
                console.log('Playback error:', error);
            }
        }
    };

    const tabs = ['All', 'Songs', 'Artists', 'Playlists'];

    const renderResultItem = ({ item, index }: { item: any; index: number }) => {
        if (item.type === 'api_song') {
            const isActive = currentPlayingId === item.id;
            // Build playlist data from all API songs for queue navigation
            const playlistData = combinedResults
                .filter((r: any) => r.type === 'api_song')
                .map((s: any) => ({
                    title: s.title,
                    artist: s.artist,
                    artwork: s.artwork || 'https://picsum.photos/seed/music/300',
                    duration: s.duration,
                    likes: 0,
                    album: s.album,
                    genre: '',
                    url: s.url,
                }));
            const songIndex = combinedResults
                .filter((r: any) => r.type === 'api_song')
                .findIndex((s: any) => s.id === item.id);
            return (
                <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => {
                        navigation.navigate('SongDetail', {
                            song: {
                                title: item.title,
                                artist: item.artist,
                                artwork: item.artwork || 'https://picsum.photos/seed/music/300',
                                duration: item.duration,
                                likes: 0,
                                album: item.album,
                                genre: '',
                                url: item.url,
                            },
                            playlist: playlistData,
                            currentIndex: songIndex >= 0 ? songIndex : 0,
                        });
                    }}
                    activeOpacity={0.7}
                >
                    <Image
                        source={{ uri: item.artwork || 'https://picsum.photos/seed/music/300' }}
                        style={styles.apiSongCover}
                    />
                    <View style={styles.resultInfo}>
                        <Text style={[styles.resultTitle, isActive && { color: '#1DB954' }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.resultSubtitle} numberOfLines={1}>
                            {item.artist} {item.album && item.album !== 'Unknown Album' ? `• ${item.album}` : ''}
                        </Text>
                    </View>
                    <View style={styles.resultRight}>
                        <Text style={styles.apiSongDuration}>{item.duration}</Text>
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={() => playSong(item, true)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon
                                name={isActive && isPlaying ? 'pause-circle' : 'play-circle'}
                                size={32}
                                color={isActive ? '#1DB954' : '#FFFFFF'}
                            />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            );
        }
        if (item.type === 'song') {
            const songResults = combinedResults.filter((r: any) => r.type === 'song');
            const playlistData = songResults.map((s: any) => {
                const full = getSongByName(s.title);
                return full ? {
                    title: full.title,
                    artist: full.artist,
                    artwork: full.artwork || 'https://picsum.photos/seed/song/400',
                    duration: full.duration,
                    likes: full.play_count || 0,
                    album: full.album,
                    genre: full.genre,
                    url: full.url,
                } : null;
            }).filter(Boolean);
            const songIndex = songResults.findIndex((s: any) => s.title === item.title);
            return (
                <TouchableOpacity style={styles.resultItem} onPress={() => {
                    const fullSong = getSongByName(item.title);
                    if (fullSong) {
                        navigation.navigate('SongDetail', {
                            song: {
                                title: fullSong.title,
                                artist: fullSong.artist,
                                artwork: fullSong.artwork || 'https://picsum.photos/seed/song/400',
                                duration: fullSong.duration,
                                likes: fullSong.play_count || 0,
                                album: fullSong.album,
                                genre: fullSong.genre,
                                url: fullSong.url,
                            },
                            playlist: playlistData,
                            currentIndex: songIndex >= 0 ? songIndex : 0,
                        });
                    }
                }} activeOpacity={0.7}>
                    <View style={styles.resultIconContainer}>
                        <Text style={styles.resultEmoji}>🎵</Text>
                    </View>
                    <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle}>{item.title}</Text>
                        <Text style={styles.resultSubtitle}>{item.artist}</Text>
                    </View>
                    <View style={styles.resultBadge}>
                        <Text style={styles.resultBadgeText}>Song</Text>
                    </View>
                    <Icon name="play-circle-outline" size={24} color={'#ffffff'} />
                </TouchableOpacity>
            );
        }
        if (item.type === 'artist') {
            return (
                <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => navigation.navigate('ArtistDetail', { artist: item.name })}
                    activeOpacity={0.7}
                >
                    <View style={[styles.resultIconContainer, { backgroundColor: '#2C2C2C' }]}>
                        <Text style={styles.resultEmoji}>🎤</Text>
                    </View>
                    <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle}>{item.name}</Text>
                        <Text style={styles.resultSubtitle}>{item.songs}</Text>
                    </View>
                    <View style={[styles.resultBadge, { backgroundColor: '#6C63FF20' }]}>
                        <Text style={[styles.resultBadgeText, { color: '#6C63FF' }]}>Artist</Text>
                    </View>
                    <Icon name="chevron-forward-outline" size={20} color="#666" />
                </TouchableOpacity>
            );
        }
        if (item.type === 'playlist') {
            return (
                <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() =>
                        navigation.navigate('PlaylistDetail', {
                            title: item.title,
                            subtitle: item.songs,
                            color: '#1DB954',
                            emoji: '🎶',
                            trackList: getSongsByGenre(item.id || ''),
                        })
                    }
                    activeOpacity={0.7}
                >
                    <View style={[styles.resultIconContainer, { backgroundColor: '#FFD93D30' }]}>
                        <Text style={styles.resultEmoji}>🎶</Text>
                    </View>
                    <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle}>{item.title}</Text>
                        <Text style={styles.resultSubtitle}>{item.songs}</Text>
                    </View>
                    <View style={[styles.resultBadge, { backgroundColor: '#FFD93D20' }]}>
                        <Text style={[styles.resultBadgeText, { color: '#FFD93D' }]}>Playlist</Text>
                    </View>
                    <Icon name="chevron-forward-outline" size={20} color="#666" />
                </TouchableOpacity>
            );
        }
        return null;
    };

    const renderRecentItem = (item: string, index: number) => (
        <TouchableOpacity key={index} style={styles.recentItem} onPress={() => performSearch(item)}>
            <Icon name="time-outline" size={16} color="#666" />
            <Text style={styles.recentText}>{item}</Text>
            <TouchableOpacity onPress={() => setRecentSearches(recentSearches.filter((_, i) => i !== index))}>
                <Icon name="close-outline" size={18} color="#666" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const genreEmoji: { [key: string]: string } = {
        'Pop': '🎵', 'Dubstep': '🔊', 'Hip-Hop/Rap': '🎤',
        'Soundtrack': '🎬', 'Rock': '🎸', 'Electronic': '⚡',
        'Hip-Hop': '🎤', 'Sad': '😢', 'Romantic': '❤️',
        'Lofi': '🎧', 'Party': '🎉', 'Ambient': '🌊',
        'Workout': '💪', 'Focus': '🎯', 'Meditation': '🧘',
        'Classical': '🎻', 'Other': '🎶',
    };

    const renderCategoryCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => {
                setSearchQuery(item.name);
                performSearch(item.name);
            }}
        >
            <View style={[styles.categoryIcon, { backgroundColor: '#1DB95420' }]}>
                <Text style={styles.categoryEmoji}>{genreEmoji[item.name] || '🎶'}</Text>
            </View>
            <Text style={styles.categoryTitle}>{item.name}</Text>
            <Text style={styles.categoryCount}>{item.songCount} songs</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Search</Text>
                    <View style={styles.headerRight} />
                </View>

                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={22} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search songs, artists..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={performSearch}
                        onSubmitEditing={() => saveToHistory(searchQuery)}
                        autoFocus
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <Icon name="close-circle" size={22} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* <View style={styles.tabsContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => {
                                setActiveTab(tab);
                                if (searchQuery) performSearch(searchQuery);
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View> */}

                {searchQuery.length > 0 ? (
                    <FlatList
                        data={combinedResults}
                        renderItem={renderResultItem}
                        keyExtractor={(item, idx) => String(item.id || item.name || idx) + item.type}
                        contentContainerStyle={styles.resultsList}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            apiLoading ? (
                                <View style={styles.apiLoadingContainer}>
                                    <ActivityIndicator size="small" color="#1DB954" />
                                    <Text style={styles.apiLoadingText}>Searching online...</Text>
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            !apiLoading ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyTitle}>No results found</Text>
                                    <Text style={styles.emptySubtitle}>Try a different search</Text>
                                </View>
                            ) : null
                        }
                    />
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {recentSearches.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                                    <TouchableOpacity onPress={() => setRecentSearches([])}>
                                        <Text style={styles.clearAllText}>Clear All</Text>
                                    </TouchableOpacity>
                                </View>
                                {recentSearches.map((item, index) => renderRecentItem(item, index))}
                            </View>
                        )}

                        {/* <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Browse by Genre</Text>
                            <FlatList
                                data={genres}
                                renderItem={renderCategoryCard}
                                keyExtractor={(item) => item.name}
                                numColumns={2}
                                scrollEnabled={false}
                                contentContainerStyle={styles.categoryGrid}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Trending Songs</Text>
                            </View>
                            {allSongs.slice(0, 4).map((song, index) => (
                                <TouchableOpacity
                                    key={song.id}
                                    style={styles.trendingItem}
                                    onPress={() => playSong(song)}
                                >
                                    <Text style={styles.trendingIndex}>{index + 1}</Text>
                                    <View style={styles.trendingIcon}>
                                        <Text style={styles.trendingEmoji}>🎵</Text>
                                    </View>
                                    <View style={styles.trendingInfo}>
                                        <Text style={styles.trendingTitle}>{song.title}</Text>
                                        <Text style={styles.trendingArtist}>{song.artist}</Text>
                                    </View>
                                    <Text style={styles.trendingDuration}>{song.duration}</Text>
                                </TouchableOpacity>
                            ))}
                        </View> */}

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    keyboardAvoid: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 16,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
    headerRight: { width: 40 },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E',
        borderRadius: 12, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', height: 50,
    },
    searchIcon: { marginRight: 12 },
    searchInput: { flex: 1, color: '#FFFFFF', fontSize: 16, padding: 0 },
    clearButton: { padding: 4 },
    tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
    tab: {
        paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    activeTab: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
    tabText: { color: '#B3B3B3', fontSize: 14, fontWeight: '600' },
    activeTabText: { color: '#121212' },
    scrollContent: { paddingBottom: 20 },
    resultsList: { paddingHorizontal: 16, paddingBottom: 100 },
    resultItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E',
        borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    resultIconContainer: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#2C2C2C',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    resultEmoji: { fontSize: 24 },
    resultInfo: { flex: 1 },
    resultTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 2 },
    resultSubtitle: { color: '#B3B3B3', fontSize: 13 },
    resultBadge: {
        backgroundColor: '#1DB95420', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12, marginRight: 10,
    },
    resultBadgeText: { color: '#1DB954', fontSize: 10, fontWeight: '600' },
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
    },
    sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    clearAllText: { color: '#1DB954', fontSize: 13, fontWeight: '600' },
    recentItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E',
        borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8,
        gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    recentText: { flex: 1, color: '#FFFFFF', fontSize: 14 },
    categoryGrid: { gap: 10 },
    categoryCard: {
        flex: 1, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16,
        marginTop: 12, marginHorizontal: 5, marginBottom: 10, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    categoryIcon: {
        width: 50, height: 50, borderRadius: 25, justifyContent: 'center',
        alignItems: 'center', marginBottom: 8,
    },
    categoryEmoji: { fontSize: 24 },
    categoryTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
    categoryCount: { color: '#B3B3B3', fontSize: 12, marginTop: 2 },
    trendingItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    trendingIndex: { width: 24, color: '#666', fontSize: 14, fontWeight: '500', textAlign: 'center' },
    trendingIcon: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#2C2C2C',
        justifyContent: 'center', alignItems: 'center', marginHorizontal: 12,
    },
    trendingEmoji: { fontSize: 20 },
    trendingInfo: { flex: 1 },
    trendingTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
    trendingArtist: { color: '#B3B3B3', fontSize: 13 },
    trendingDuration: { color: '#666', fontSize: 13 },
    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 8 },
    emptySubtitle: { color: '#B3B3B3', fontSize: 14, textAlign: 'center' },
    apiSongCover: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
    },
    resultRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    apiSongDuration: {
        color: '#B3B3B3',
        fontSize: 13,
        marginRight: 12,
    },
    playButton: {
        padding: 4,
    },
    apiLoadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    apiLoadingText: {
        color: '#B3B3B3',
        fontSize: 13,
    },
});

export default SearchScreen;
