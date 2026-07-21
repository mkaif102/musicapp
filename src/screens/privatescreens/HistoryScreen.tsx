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
    Alert,
    SectionList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer from 'react-native-track-player';
import { getAllSongs, songToTrack, type Song } from '../../data/songs';

const HistoryScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Time');

    const allSongs = getAllSongs();

    const historyData = [
        {
            title: 'Today',
            data: allSongs.slice(0, 3).map((s, i) => ({
                ...s,
                playedAt: `${(i + 1) * 5} min ago`,
                playCount: 3 - i,
            })),
        },
        {
            title: 'Yesterday',
            data: allSongs.slice(3, 5).map((s) => ({
                ...s,
                playedAt: 'Yesterday',
                playCount: 2,
            })),
        },
        {
            title: 'This Week',
            data: allSongs.slice(5).map((s, i) => ({
                ...s,
                playedAt: `${i + 3} days ago`,
                playCount: 4 - i,
            })),
        },
    ];

    const filters = ['All Time', 'Today', 'This Week', 'This Month'];

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

    const handleClearHistory = () => {
        Alert.alert('Clear History', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear All', style: 'destructive' },
        ]);
    };

    const getTotalPlayTime = () => {
        let totalMinutes = 0;
        historyData.forEach((section) => {
            section.data.forEach((song: any) => {
                const minutes = parseInt(song.duration.split(':')[0]);
                totalMinutes += minutes * song.playCount;
            });
        });
        return totalMinutes;
    };

    const renderHistoryItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.historyItem} onPress={() => handlePlaySong(item)} activeOpacity={0.8}>
            <View style={styles.songImage}>
                <Text style={styles.songEmoji}>🎵</Text>
            </View>
            <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.songMeta}>
                    <Text style={styles.songArtist}>{item.artist}</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.songDuration}>{item.duration}</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.playedAt}>{item.playedAt}</Text>
                </View>
                <View style={styles.playCountContainer}>
                    <Icon name="play-outline" size={12} color="#666" />
                    <Text style={styles.playCountText}>Played {item.playCount} times</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.playButtonSmall}>
                <Icon name="play-circle" size={28} color={'#ffffff'} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }: any) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionLine} />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
                            <Icon name="arrow-back" size={24} color={'#ffffff'} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>History</Text>
                    </View>
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory} activeOpacity={0.7}>
                        <Icon name="trash-outline" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{allSongs.length}</Text>
                        <Text style={styles.statLabel}>Total Songs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{getTotalPlayTime()}m</Text>
                        <Text style={styles.statLabel}>Total Time</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{historyData.length}</Text>
                        <Text style={styles.statLabel}>Days</Text>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search history..."
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

                <SectionList
                    sections={historyData}
                    renderItem={renderHistoryItem}
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.historyList}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    stickySectionHeadersEnabled={false}
                />
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
    clearButton: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,59,48,0.1)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1,
        borderColor: 'rgba(255,59,48,0.2)',
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
    historyList: { paddingBottom: 100 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginRight: 12 },
    sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
    historyItem: {
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
    songMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    songArtist: { fontSize: 13, color: '#B3B3B3' },
    songDuration: { fontSize: 12, color: '#666' },
    playedAt: { fontSize: 12, color: '#666' },
    metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#B3B3B3', marginHorizontal: 6 },
    playCountContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
    playCountText: { fontSize: 11, color: '#666' },
    playButtonSmall: { padding: 4 },
    separator: { height: 10 },
});

export default HistoryScreen;
