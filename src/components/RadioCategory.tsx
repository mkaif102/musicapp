// src/components/home/RadioCategory.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CategoryHeader from './CategoryHeader';

const RADIO_API = 'https://de1.api.radio-browser.info/json';
const RADIO_IMAGES = [
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=200&auto=format&fit=crop',
];

const COLORS = [
    '#1DB954', '#FF6B6B', '#4ECDC4', '#FFD93D',
    '#6C5CE7', '#FD79A8', '#00B894', '#0984E3'
];

interface RadioStation {
    stationuuid: string;
    name: string;
    url_resolved: string;
    favicon: string;
    tags: string;
    country: string;
    votes: number;
    clickcount: number;
    lastcheckok: number;
}

interface RadioCategoryProps {
    recentPlayed?: any[];
    navigation?: any;
}

const RadioCategory: React.FC<RadioCategoryProps> = ({
    recentPlayed = [],
    navigation
}) => {
    const nav = navigation || useNavigation();
    const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRadioStations();
    }, []);

    const fetchRadioStations = async () => {
        try {
            setLoading(true);
            setError(null);
            const tags = ['pop', 'rock', 'jazz', 'hiphop', 'lofi', 'bollywood', 'electronic', 'classical'];
            const results: RadioStation[] = [];
            for (const tag of tags) {
                try {
                    const res = await fetch(
                        `${RADIO_API}/stations/search?tag=${tag}&hidebroken=true&order=clickcount&limit=1`,
                        { headers: { 'User-Agent': 'MusicApp/1.0' } }
                    );
                    const data = await res.json();
                    if (data.length > 0 && data[0].lastcheckok === 1) {
                        results.push(data[0]);
                    }
                } catch (e) {
                    console.log(`Error fetching ${tag} station:`, e);
                }
            }
            setRadioStations(results);
        } catch (error) {
            console.log('Error fetching radio stations:', error);
            setError('Failed to load radio stations');
        } finally {
            setLoading(false);
        }
    };

    const renderStationItem = (station: RadioStation, index: number) => {
        const imageSource = station.favicon || RADIO_IMAGES[index % RADIO_IMAGES.length];
        return (
            <TouchableOpacity
                key={station.stationuuid || `station-${index}`}
                style={styles.radioCard}
                activeOpacity={0.85}
                onPress={() => nav.navigate('Radio', { stationId: station.stationuuid })}
            >
                <View style={styles.radioImageContainer}>
                    <Image
                        source={{ uri: imageSource }}
                        style={styles.radioImage}

                    />
                    {station.lastcheckok === 1 && (
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.radioName} numberOfLines={1}>{station.name || 'Unknown Station'}</Text>
                <View style={styles.radioTags}>
                    {station.tags && (
                        <Text style={styles.radioTag} numberOfLines={1}>
                            {station.tags.split(',')[0]}
                        </Text>
                    )}
                    {station.country && (
                        <Text style={styles.radioCountry}>• {station.country}</Text>
                    )}
                </View>
                <View style={styles.radioStats}>
                    <Icon name="headset-outline" size={10} color="#666" />
                    <Text style={styles.radioStatsText}>
                        {station.clickcount || station.votes || 0}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderGenreChip = (genre: string, index: number) => (
        <TouchableOpacity
            key={genre}
            style={[styles.radioGenreChip, { borderColor: COLORS[index % COLORS.length] }]}
            activeOpacity={0.8}
            onPress={() => nav.navigate('Radio', { genre })}
        >
            <Text style={[styles.radioGenreText, { color: COLORS[index % COLORS.length] }]}>
                {genre}
            </Text>
        </TouchableOpacity>
    );

    const renderRecentItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.recentCard}
            activeOpacity={0.8}
            onPress={() => nav.navigate('SongDetail', { song: item })}
        >
            <View style={styles.recentImageContainer}>
                {item.artwork ? (
                    <Image source={{ uri: item.artwork }} style={styles.recentArt} />
                ) : (
                    <View style={styles.fallbackArtContainer}>
                        <Icon name="musical-notes-outline" size={30} color="#888888" />
                    </View>
                )}
            </View>
            <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.radioHeroContainer}>
                <View style={styles.radioHeroInner}>
                    <View style={styles.radioIconContainer}>
                        <Icon name="radio" size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.radioHeroTitle}>Live Radio</Text>
                    <Text style={styles.radioHeroSubtitle}>
                        {loading ? 'Loading stations...' :
                            error ? 'Unable to load stations' :
                                `${radioStations.length} stations available`}
                    </Text>
                    {loading && (
                        <ActivityIndicator size="small" color="#1DB954" style={{ marginTop: 12 }} />
                    )}
                    {error && (
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={fetchRadioStations}
                        >
                            <Icon name="refresh-outline" size={16} color="#1DB954" />
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <CategoryHeader title="Popular Stations" showSeeAll={false} />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
            >
                {radioStations.length > 0 ? (
                    radioStations.map((station, index) => renderStationItem(station, index))
                ) : (
                    // Fallback stations if API fails
                    ['Synth Station', 'Chill Jazz', 'Indie Rock', 'Focus Beats', 'Pop Hits', 'Classical'].map((station, index) => (
                        <TouchableOpacity
                            key={station}
                            style={styles.radioCard}
                            activeOpacity={0.85}
                            onPress={() => nav.navigate('Radio')}
                        >
                            <Image
                                source={{ uri: RADIO_IMAGES[index % RADIO_IMAGES.length] }}
                                style={styles.radioImage}
                            />
                            <Text style={styles.radioName} numberOfLines={1}>{station}</Text>
                            <Text style={styles.radioTag}>Music</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <CategoryHeader title="Browse by Genre" showSeeAll={false} />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
            >
                {['Pop', 'Rock', 'Jazz', 'Hip Hop', 'Electronic', 'Classical', 'Bollywood', 'Lofi'].map((genre, index) =>
                    renderGenreChip(genre, index)
                )}
            </ScrollView>

            {recentPlayed.length > 0 && (
                <>
                    <CategoryHeader title="Recently Played" showSeeAll={false} />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    >
                        {recentPlayed.slice(0, 4).map((item) => renderRecentItem(item))}
                    </ScrollView>
                </>
            )}

            <View style={styles.radioInfoContainer}>
                <View style={styles.radioInfoCard}>
                    <Icon name="musical-notes" size={20} color="#1DB954" />
                    <Text style={styles.radioInfoText}>
                        {radioStations.length > 0 ?
                            `${radioStations.length}+ stations available` :
                            'Discover thousands of radio stations'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    horizontalList: {
        paddingLeft: 20,
        paddingRight: 8,
        paddingBottom: 4,
    },
    radioHeroContainer: {
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 12,
        backgroundColor: '#151515',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(29,185,84,0.2)',
    },
    radioHeroInner: {
        alignItems: 'center',
    },
    radioIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    radioHeroTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        marginTop: 12,
    },
    radioHeroSubtitle: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(29,185,84,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(29,185,84,0.2)',
    },
    retryText: {
        color: '#1DB954',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    radioCard: {
        width: 96,
        marginRight: 16,
        alignItems: 'center',
    },
    radioImageContainer: {
        position: 'relative',
    },
    radioImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: '#222',
    },
    liveIndicator: {
        position: 'absolute',
        top: 4,
        right: 4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF0055',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,0,85,0.3)',
    },
    liveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
        marginRight: 3,
    },
    liveText: {
        color: '#FFFFFF',
        fontSize: 7,
        fontWeight: '800',
    },
    radioName: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    radioTags: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    radioTag: {
        color: '#1DB954',
        fontSize: 9,
        fontWeight: '600',
        textAlign: 'center',
    },
    radioCountry: {
        color: '#666',
        fontSize: 9,
        marginLeft: 4,
    },
    radioStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        gap: 4,
    },
    radioStatsText: {
        color: '#666',
        fontSize: 9,
    },
    radioGenreChip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
    radioGenreText: {
        fontSize: 13,
        fontWeight: '700',
    },
    recentCard: {
        width: 110,
        marginRight: 14,
    },
    recentImageContainer: {
        width: 110,
        height: 110,
        borderRadius: 10,
        backgroundColor: '#151515',
        overflow: 'hidden',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    recentArt: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    fallbackArtContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    recentArtist: {
        color: '#888888',
        fontSize: 11,
        marginTop: 1,
    },
    radioInfoContainer: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 8,
    },
    radioInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#151515',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 12,
    },
    radioInfoText: {
        color: '#888',
        fontSize: 13,
        flex: 1,
    },
});

export default RadioCategory;