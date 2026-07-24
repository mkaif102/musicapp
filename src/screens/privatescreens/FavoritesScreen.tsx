import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    TextInput,
    FlatList,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer from 'react-native-track-player';
import { getAllSongs, songToTrack, type Song } from '../../data/songs';

const FavoritesScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    const favoriteSongs = getAllSongs().slice(0, 5);
    const filters = ['All', 'Songs', 'Recently Added'];

    const handlePlaySong = async (song: Song) => {
        try {
            const track = songToTrack(song);
            await TrackPlayer.reset();
            await TrackPlayer.add(track);
            await TrackPlayer.play();
        } catch (error) {
            Alert.alert('Error', 'Could not play song.');
        }
    };

    const handleRemoveFavorite = (id: string) => {
        Alert.alert('Remove from Favorites', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive' },
        ]);
    };

    const filteredSongs = favoriteSongs.filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                            <Icon name="arrow-back" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Favorites</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.shuffleButton}
                        onPress={() => Alert.alert('Shuffle', 'Playing all favorites shuffled!')}
                        activeOpacity={0.7}
                    >
                        <Icon name="shuffle" size={24} color={'#ffffff'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{favoriteSongs.length}</Text>
                        <Text style={styles.statLabel}>Favorite Songs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>JioSaavn</Text>
                        <Text style={styles.statLabel}>Source</Text>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search favorites..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.filtersWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
                                onPress={() => setSelectedFilter(filter)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {filteredSongs.length > 0 ? (
                    <FlatList
                        data={filteredSongs}
                        renderItem={({ item, index }) => {
                            const playlistData = filteredSongs.map((s) => ({
                                title: s.title,
                                artist: s.artist,
                                artwork: s.artwork || 'https://picsum.photos/seed/song/400',
                                duration: s.duration,
                                likes: s.play_count || 0,
                                album: s.album,
                                genre: s.genre,
                                url: s.url,
                            }));
                            return (
                            <TouchableOpacity style={styles.songCard} onPress={() => {
                                navigation.navigate('SongDetail', {
                                    song: {
                                        title: item.title,
                                        artist: item.artist,
                                        artwork: item.artwork || 'https://picsum.photos/seed/song/400',
                                        duration: item.duration,
                                        likes: item.play_count || 0,
                                        album: item.album,
                                        genre: item.genre,
                                        url: item.url,
                                    },
                                    playlist: playlistData,
                                    currentIndex: index,
                                });
                            }} activeOpacity={0.8}>
                                <View style={styles.songImage}>
                                    <Text style={styles.songEmoji}>🎵</Text>
                                </View>
                                <View style={styles.songInfo}>
                                    <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                                    <View style={styles.songMeta}>
                                        <Text style={styles.songArtist}>{item.artist}</Text>
                                        <View style={styles.metaDot} />
                                        <Text style={styles.songDuration}>{item.duration}</Text>
                                    </View>
                                    {item.genre && (
                                        <View style={styles.genreBadge}>
                                            <Text style={styles.genreText}>{item.genre}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.songActions}>
                                    <TouchableOpacity style={styles.favoriteButton} onPress={() => handleRemoveFavorite(item.id)}>
                                        <Icon name="heart" size={20} color="#FF3B30" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.playButtonSmall}>
                                        <Icon name="play-circle" size={28} color={'#ffffff'} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                            );
                        }}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentList}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No favorites yet</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Search')}>
                            <Text style={styles.emptyButtonText}>Discover Music</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#121212' },
    container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 50, paddingBottom: 20,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    backButton: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E1E1E',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)', marginRight: 12,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
    shuffleButton: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: '#1DB954',
        justifyContent: 'center', alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 14, padding: 16,
        marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'space-around', alignItems: 'center',
    },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
    statLabel: { fontSize: 12, color: '#B3B3B3', marginTop: 2 },
    statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E',
        borderRadius: 12, paddingHorizontal: 14, marginBottom: 16, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)', height: 48,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: '#ffffff', fontSize: 16, padding: 0 },
    filtersWrapper: { height: 40, marginBottom: 16, justifyContent: 'center' },
    filtersContent: { paddingVertical: 2, paddingHorizontal: 2, alignItems: 'center' },
    filterButton: {
        height: 34, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center',
        borderRadius: 20, backgroundColor: '#1E1E1E', marginRight: 10, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    filterButtonActive: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
    filterText: { color: '#B3B3B3', fontSize: 13, fontWeight: '600', textAlign: 'center' },
    filterTextActive: { color: '#121212' },
    contentList: { paddingBottom: 100 },
    songCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E',
        borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    songImage: {
        width: 55, height: 55, borderRadius: 10, backgroundColor: '#2C2C2C',
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    songEmoji: { fontSize: 24 },
    songInfo: { flex: 1, marginRight: 8 },
    songTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 2 },
    songMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    songArtist: { fontSize: 13, color: '#B3B3B3' },
    songDuration: { fontSize: 12, color: '#666' },
    metaDot: {
        width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#B3B3B3', marginHorizontal: 6,
    },
    genreBadge: {
        backgroundColor: 'rgba(29, 185, 84, 0.15)', paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 10, alignSelf: 'flex-start',
    },
    genreText: { color: '#1DB954', fontSize: 10, fontWeight: '600' },
    songActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    favoriteButton: { padding: 4 },
    playButtonSmall: { padding: 4 },
    separator: { height: 10 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 24 },
    emptyButton: { backgroundColor: '#1DB954', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
    emptyButtonText: { color: '#121212', fontSize: 16, fontWeight: '700' },
});

export default FavoritesScreen;
