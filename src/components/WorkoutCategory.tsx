import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import CategoryHeader from './CategoryHeader';
import HeroBanner from './HeroBanner';
import SongRow from './SongRow';
import { Song } from '../data/songs';

const WORKOUT_IMAGES = [
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=300&auto=format&fit=crop',
];

interface WorkoutCategoryProps {
    songs: Song[];
    onPlaySong: (song: Song) => void;
    onPlayPlaylist: (tracks: Song[]) => void;
}

const WorkoutCategory: React.FC<WorkoutCategoryProps> = ({ songs, onPlaySong, onPlayPlaylist }) => {
    return (
        <View>
            <HeroBanner
                imageUrl={WORKOUT_IMAGES[0]}
                badgeIcon="flash"
                badgeText="HIGH ENERGY"
                badgeColor="#FF6B6B"
                title="Workout Mix"
                subtitle="High-energy tracks to fuel your workout and push your limits."
                buttonText="Start Workout"
                onPress={() => onPlayPlaylist(songs)}
            />

            <CategoryHeader title="Workout Playlists" showSeeAll={false} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                {WORKOUT_IMAGES.map((img, index) => (
                    <TouchableOpacity key={index} style={styles.workoutCard} activeOpacity={0.8} onPress={() => onPlayPlaylist(songs)}>
                        <Image source={{ uri: img }} style={styles.workoutImage} />
                        <Text style={styles.workoutCardTitle}>{['Warm Up', 'Cardio Blast', 'Strength', 'Cool Down'][index]}</Text>
                        <Text style={styles.workoutCardSub}>{['Light beats to get started', 'High BPM cardio tracks', 'Heavy lifting anthems', 'Stretch and recover'][index]}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <CategoryHeader title="Top Workout Tracks" showSeeAll={false} />
            {songs.map((song) => (
                <SongRow
                    key={song.id}
                    song={song}
                    accent="#1DB954"
                    onPress={() => onPlaySong(song)}
                />
            ))}

            <CategoryHeader title="Workout Timer" showSeeAll={false} />
            <View style={styles.timerCard}>
                <Text style={styles.timerTitle}>Set Your Timer</Text>
                <View style={styles.timerRow}>
                    {['15 min', '30 min', '45 min', '60 min'].map((time) => (
                        <TouchableOpacity key={time} style={styles.timerChip} activeOpacity={0.8}>
                            <Text style={styles.timerChipText}>{time}</Text>
                            <Text style={styles.timerChipLabel}>duration</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    horizontalList: { paddingLeft: 20, paddingRight: 8 },
    workoutCard: { width: 140, marginRight: 14 },
    workoutImage: { width: 140, height: 100, borderRadius: 12, marginBottom: 6 },
    workoutCardTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    workoutCardSub: { color: '#888', fontSize: 10, marginTop: 2 },
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

export default WorkoutCategory;