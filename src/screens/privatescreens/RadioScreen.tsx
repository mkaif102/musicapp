import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    StatusBar,
    Image,
    TextInput,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
    usePlaybackState,
    State,
    useActiveTrack,
} from 'react-native-track-player';
import { colors } from '../../theme/Colors';

const { width } = Dimensions.get('window');
const API_BASE = 'https://de1.api.radio-browser.info/json';

interface RadioStation {
    stationuuid: string;
    name: string;
    url: string;
    url_resolved: string;
    favicon: string;
    tags: string;
    country: string;
    countrycode: string;
    codec: string;
    bitrate: number;
    votes: number;
    lastcheckok: number;
}

const GENRES = [
    { label: 'All', value: '' },
    { label: 'Pop', value: 'pop' },
    { label: 'Rock', value: 'rock' },
    { label: 'Jazz', value: 'jazz' },
    { label: 'Hip Hop', value: 'hiphop' },
    { label: 'Classical', value: 'classical' },
    { label: 'Electronic', value: 'electronic' },
    { label: 'Bollywood', value: 'bollywood' },
    { label: 'Punjabi', value: 'punjabi' },
    { label: 'Lofi', value: 'lofi' },
    { label: 'Dance', value: 'dance' },
    { label: 'Chill', value: 'chillout' },
];

const RadioScreen = ({ navigation }: any) => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeGenre, setActiveGenre] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const playbackState = usePlaybackState();
    const activeTrack = useActiveTrack();
    const isPlaying = playbackState?.state === State.Playing;

    const fetchStations = useCallback(async (genre: string = '', search: string = '') => {
        try {
            setLoading(true);
            let url = `${API_BASE}/stations/search?hidebroken=true&order=clickcount&limit=50`;
            if (genre) url += `&tag=${encodeURIComponent(genre)}`;
            if (search) url += `&name=${encodeURIComponent(search)}`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'MusicApp/1.0' },
            });
            const data = await response.json();
            setStations(data.filter((s: RadioStation) => s.lastcheckok === 1));
        } catch (error) {
            console.log('Error fetching radio stations:', error);
            setStations([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStations(activeGenre, searchQuery);
    }, [activeGenre]);

    const handleGenrePress = (value: string) => {
        setActiveGenre(value);
        setSearchQuery('');
    };

    const playStation = async (station: RadioStation) => {
        try {
            const streamUrl = station.url_resolved || station.url;
            if (!streamUrl) {
                Alert.alert('Error', 'Station URL not available');
                return;
            }
            await TrackPlayer.reset();
            await TrackPlayer.add({
                id: station.stationuuid,
                url: streamUrl,
                title: station.name,
                artist: station.tags ? station.tags.split(',').slice(0, 2).join(', ') : 'Radio',
                artwork: station.favicon || 'https://picsum.photos/seed/radio/400',
                duration: undefined,
            });
            await TrackPlayer.play();
        } catch (error) {
            console.log('Error playing station:', error);
            Alert.alert('Error', 'Could not connect to this station. Try another one.');
        }
    };

    const renderStation = ({ item }: { item: RadioStation }) => {
        const isActive = activeTrack?.id === item.stationuuid;
        return (
            <TouchableOpacity
                style={[styles.stationCard, isActive && styles.stationCardActive]}
                activeOpacity={0.8}
                onPress={() => playStation(item)}
            >
                <View style={styles.stationImageContainer}>
                    {item.favicon ? (
                        <Image source={{ uri: item.favicon }} style={styles.stationImage} />
                    ) : (
                        <View style={styles.stationFallback}>
                            <Icon name="musical-notes" size={28} color="#1DB954" />
                        </View>
                    )}
                    <View style={[styles.playOverlay, isActive && styles.playOverlayActive]}>
                        {isActive && isPlaying ? (
                            <Icon name="pause" size={18} color="#FFFFFF" />
                        ) : (
                            <Icon name="play" size={18} color="#FFFFFF" />
                        )}
                    </View>
                </View>
                <Text style={[styles.stationName, isActive && styles.stationNameActive]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.stationGenre} numberOfLines={1}>
                    {item.tags ? item.tags.split(',').slice(0, 2).join(', ') : 'Music'}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Radio</Text>
                    <Text style={styles.headerCount}>{stations.length} stations</Text>
                </View>
                <View style={{ width: 38 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Icon name="search-outline" size={18} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search stations..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => fetchStations(activeGenre, searchQuery)}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); fetchStations(activeGenre); }}>
                            <Icon name="close-circle" size={18} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genreContainer}
            >
                {GENRES.map((g) => (
                    <TouchableOpacity
                        key={g.value}
                        style={[styles.genrePill, activeGenre === g.value && styles.genrePillActive]}
                        onPress={() => handleGenrePress(g.value)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.genreText, activeGenre === g.value && styles.genreTextActive]}>
                            {g.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={styles.loadingText}>Loading stations...</Text>
                </View>
            ) : (
                <FlatList
                    data={stations}
                    renderItem={renderStation}
                    keyExtractor={(item) => item.stationuuid}
                    numColumns={3}
                    contentContainerStyle={styles.gridContent}
                    columnWrapperStyle={styles.gridRow}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); fetchStations(activeGenre, searchQuery); }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="radio-outline" size={50} color="#333" />
                            <Text style={styles.emptyText}>No stations found</Text>
                        </View>
                    }
                />
            )}

            {isPlaying && activeTrack && (
                <View style={styles.nowPlayingBar}>
                    <View style={styles.nowPlayingDot} />
                    <Text style={styles.nowPlayingText} numberOfLines={1}>{activeTrack.title}</Text>
                    <TouchableOpacity onPress={() => TrackPlayer.pause()}>
                        <Icon name="pause" size={22} color="#1DB954" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A0A0A' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#151515',
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    headerCount: { color: '#888', fontSize: 11, marginTop: 2 },

    searchContainer: { paddingHorizontal: 16, marginBottom: 10 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14, marginLeft: 10 },

    genreContainer: { paddingHorizontal: 16, paddingBottom: 20, gap: 8,height: 54 },
    genrePill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#151515',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    genrePillActive: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
    genreText: { color: '#A7A7A7', fontSize: 13, fontWeight: '600' },
    genreTextActive: { color: '#000000', fontWeight: '700' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#888', fontSize: 13, marginTop: 12 },

    gridContent: { paddingHorizontal: 16, paddingBottom: 100 },
    gridRow: { justifyContent: 'space-between', marginBottom: 14 },

    stationCard: {
        width: (width - 44) / 3,
        alignItems: 'center',
    },
    stationCardActive: {},
    stationImageContainer: {
        width: (width - 44) / 3 - 8,
        height: (width - 44) / 3 - 8,
        borderRadius: 12,
        backgroundColor: '#151515',
        overflow: 'hidden',
        marginBottom: 6,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    stationImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    stationFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A2E',
    },
    playOverlay: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playOverlayActive: { backgroundColor: '#1DB954' },
    stationName: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
        width: '100%',
    },
    stationNameActive: { color: '#1DB954' },
    stationGenre: {
        color: '#888',
        fontSize: 9,
        textAlign: 'center',
        marginTop: 2,
    },

    emptyContainer: { alignItems: 'center', paddingTop: 80 },
    emptyText: { color: '#888', fontSize: 14, marginTop: 12 },

    nowPlayingBar: {
        position: 'absolute',
        bottom: 14,
        left: 12,
        right: 12,
        borderRadius: 14,
        backgroundColor: '#181818',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: colors.green,
        gap: 10,
    },
    nowPlayingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1DB954',
    },
    nowPlayingText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
});

export default RadioScreen;
