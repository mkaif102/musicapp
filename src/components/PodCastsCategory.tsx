// src/components/home/PodcastsCategory.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import CategoryHeader from './CategoryHeader';
import HeroBanner from './HeroBanner';
import SongRow from './SongRow';
import { Song } from '../data/songs';

const PODCAST_IMAGES = [
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589903308904-1010c2294adc?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=300&auto=format&fit=crop',
];

const COLORS = ['#1DB954', '#1DB954', '#1DB954', '#1DB954'];

interface PodcastsCategoryProps {
    songs: Song[];
    onPlaySong: (song: Song) => void;
}

const PodcastsCategory: React.FC<PodcastsCategoryProps> = ({ songs, onPlaySong }) => {
    const navigation = useNavigation();

    return (
        <View>
            <HeroBanner
                imageUrl={PODCAST_IMAGES[0]}
                badgeIcon="mic"
                badgeText="FEATURED PODCAST"
                title="The Daily Beat"
                subtitle="Your daily dose of music news, interviews, and behind-the-scenes stories from the industry."
                buttonText="Follow"
                onPress={() => { }}
            />

            <CategoryHeader title="Trending Podcasts" showSeeAll={false} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {PODCAST_IMAGES.map((img, index) => (
                    <TouchableOpacity key={index} style={styles.podcastCard} activeOpacity={0.8}>
                        <Image source={{ uri: img }} style={styles.podcastImage} />
                        <View style={styles.podcastInfo}>
                            <Text style={styles.podcastTitle}>{['Music Insider', 'Beat Makers', 'Studio Sessions', 'Vinyl Stories'][index]}</Text>
                            <Text style={styles.podcastSubtitle}>{['Deep dives into chart-toppers', 'Producers share their craft', 'Behind the recording glass', 'The history of vinyl records'][index]}</Text>
                        </View>
                        <View style={styles.podcastMeta}>
                            <Icon name="headset-outline" size={10} color="#666" />
                            <Text style={styles.podcastMetaText}>{[12400, 8900, 15600, 6700][index].toLocaleString()} plays</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <CategoryHeader title="Browse Categories" showSeeAll={false} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {['Music', 'Comedy', 'Tech', 'True Crime', 'News', 'Sports'].map((cat, index) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.podcastCategoryCard, { borderColor: COLORS[index % COLORS.length] + '44' }]}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.podcastCategoryText, { color: COLORS[index % COLORS.length] }]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <CategoryHeader title="New Episodes" showSeeAll={false} />
            {songs.slice(0, 5).map((song, index) => (
                <SongRow
                    key={song.id}
                    song={song}
                    onPress={() => onPlaySong(song)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    horizontalList: { paddingLeft: 20, paddingRight: 8 },
    podcastCard: {
        width: 200,
        marginRight: 14,
        backgroundColor: '#151515',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    podcastImage: { width: 200, height: 110, resizeMode: 'cover' },
    podcastInfo: { padding: 10 },
    podcastTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    podcastSubtitle: { color: '#888', fontSize: 11, marginTop: 2 },
    podcastMeta: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 10, gap: 4 },
    podcastMetaText: { color: '#666', fontSize: 10 },
    podcastCategoryCard: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
    podcastCategoryText: { fontSize: 13, fontWeight: '700' },
});

export default PodcastsCategory;