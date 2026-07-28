// src/components/home/SongRow.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Song } from '../data/songs';

interface SongRowProps {
    song: Song;
    accent?: string;
    isActive?: boolean;
    isPlaying?: boolean;
    onPress: () => void;
}

const SongRow: React.FC<SongRowProps> = ({
    song,
    accent = '#1DB954',
    isActive = false,
    isPlaying = false,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={[styles.songRow, isActive && { backgroundColor: accent + '18' }]}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <Image
                source={{ uri: song.artwork || 'https://picsum.photos/seed/song/200' }}
                style={styles.songRowImage}
            />
            <View style={styles.songRowInfo}>
                <Text style={[styles.songRowTitle, isActive && { color: accent }]} numberOfLines={1}>
                    {song.title}
                </Text>
                <Text style={styles.songRowArtist} numberOfLines={1}>
                    {song.artist}
                </Text>
            </View>
            <View style={[styles.songRowPlay, { backgroundColor: isActive ? accent : accent + 'CC' }]}>
                <Icon name={isPlaying ? 'pause' : 'play'} size={14} color="#FFFFFF" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    songRowImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#222',
    },
    songRowInfo: {
        flex: 1
    },
    songRowTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600'
    },
    songRowArtist: {
        color: '#888',
        fontSize: 12,
        marginTop: 2
    },
    songRowPlay: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SongRow;