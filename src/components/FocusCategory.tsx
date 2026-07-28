// src/components/home/FocusCategory.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import CategoryHeader from './CategoryHeader';
import HeroBanner from './HeroBanner';
import SongRow from './SongRow';
import { Song } from '../data/songs';

const FOCUS_IMAGES = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=300&auto=format&fit=crop',
];

interface FocusCategoryProps {
    songs: Song[];
    onPlaySong: (song: Song) => void;
    onPlayPlaylist: (tracks: Song[]) => void;
}

const FocusCategory: React.FC<FocusCategoryProps> = ({ songs, onPlaySong, onPlayPlaylist }) => {
    return (
        <View>
            <HeroBanner
                imageUrl={FOCUS_IMAGES[0]}
                badgeIcon="leaf"
                badgeText="ZEN MODE"
                title="Deep Focus"
                subtitle="Ambient and lofi sounds to help you concentrate and find your flow."
                buttonText="Start Session"
                onPress={() => onPlayPlaylist(songs)}
            />

            <CategoryHeader title="Focus Playlists" showSeeAll={false} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {FOCUS_IMAGES.map((img, index) => (
                    <TouchableOpacity key={index} style={styles.focusCard} activeOpacity={0.8} onPress={() => onPlayPlaylist(songs)}>
                        <Image source={{ uri: img }} style={styles.focusImage} />
                        <Text style={styles.focusCardTitle}>{['Deep Work', 'Study Session', 'Meditation', 'Sleep'][index]}</Text>
                        <Text style={styles.focusCardSub}>{['Zero distractions', 'Concentration boost', 'Mindfulness sounds', 'Drift off gently'][index]}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <CategoryHeader title="Focus Tracks" showSeeAll={false} />
            {songs.map((song) => (
                <SongRow
                    key={song.id}
                    song={song}
                    accent="#1DB954"
                    onPress={() => onPlaySong(song)}
                />
            ))}

            <CategoryHeader title="Focus Timer" showSeeAll={false} />
            <View style={styles.timerCard}>
                <Text style={styles.timerTitle}>Pomodoro Timer</Text>
                <View style={styles.timerRow}>
                    {['15 min', '30 min', '45 min', '60 min'].map((time) => (
                        <TouchableOpacity key={time} style={styles.timerChip} activeOpacity={0.8}>
                            <Text style={styles.timerChipText}>{time}</Text>
                            <Text style={styles.timerChipLabel}>focus</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    horizontalList: { paddingLeft: 20, paddingRight: 8 },
    focusCard: { width: 140, marginRight: 14 },
    focusImage: { width: 140, height: 100, borderRadius: 12, marginBottom: 6 },
    focusCardTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    focusCardSub: { color: '#888', fontSize: 10, marginTop: 2 },
    timerCard: {
        marginHorizontal: 20,
        backgroundColor: '#151515',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(78,205,196,0.2)',
        marginBottom: 12,
    },
    timerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
    timerRow: { flexDirection: 'row', gap: 10 },
    timerChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#1A1A2E',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(78,205,196,0.2)',
    },
    timerChipText: { color: '#1DB954', fontSize: 13, fontWeight: '700' },
    timerChipLabel: { color: '#666', fontSize: 10, marginTop: 2 },
});

export default FocusCategory;