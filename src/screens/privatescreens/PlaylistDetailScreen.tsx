import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Alert,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';

const parseDuration = (d: string): number => {
    const parts = String(d || '0:00').split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
};

const PlaylistDetailScreen = ({ navigation, route }: any) => {
    const {
        title = 'Playlist',
        subtitle = '',
        color = '#1DB954',
        emoji = '🎵',
        trackList = [],
    } = route.params || {};

    const [playingSongId, setPlayingSongId] = useState<string | null>(null);
    const playbackState = usePlaybackState();
    const isPlaying = playbackState?.state === State.Playing;

    const totalDurationSec = trackList.reduce(
        (acc: number, t: any) => acc + parseDuration(t.duration), 0
    );
    const totalDurationStr = (() => {
        const m = Math.floor(totalDurationSec / 60);
        if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
        return `${m} min`;
    })();

    const playPlaylist = async () => {
        if (!trackList || trackList.length === 0) return;
        try {
            const tracks = trackList.map((t: any) => ({
                id: t.id, url: t.url, title: t.title, artist: t.artist || title,
                album: t.album || title, artwork: t.artwork,
                duration: parseDuration(t.duration),
            }));
            const activeTrack = await TrackPlayer.getActiveTrack();
            if (activeTrack && activeTrack.id === tracks[0].id) {
                if (isPlaying) { await TrackPlayer.pause(); setPlayingSongId(null); }
                else { await TrackPlayer.play(); setPlayingSongId(tracks[0].id); }
                return;
            }
            await TrackPlayer.reset();
            await TrackPlayer.add(tracks);
            await TrackPlayer.play();
            setPlayingSongId(tracks[0].id);
        } catch (error) {
            console.log('Playlist error:', error);
            Alert.alert('Error', 'Could not play playlist.');
        }
    };

    const playSingleSong = async (song: any) => {
        try {
            const track = {
                id: song.id, url: song.url, title: song.title, artist: song.artist || title,
                album: song.album || title, artwork: song.artwork,
                duration: parseDuration(song.duration),
            };
            const activeTrack = await TrackPlayer.getActiveTrack();
            if (activeTrack && activeTrack.id === song.id) {
                if (isPlaying) { await TrackPlayer.pause(); setPlayingSongId(null); }
                else { await TrackPlayer.play(); setPlayingSongId(song.id); }
                return;
            }
            await TrackPlayer.reset();
            await TrackPlayer.add(track);
            await TrackPlayer.play();
            setPlayingSongId(song.id);
        } catch (error) {
            console.log('Song error:', error);
            Alert.alert('Error', 'Could not play song.');
        }
    };

    const renderSong = ({ item, index }: { item: any; index: number }) => {
        const playlistData = trackList.map((t: any) => ({
            title: t.title,
            artist: t.artist || title,
            artwork: t.artwork || 'https://picsum.photos/seed/song/400',
            duration: t.duration,
            likes: t.play_count || 0,
            album: t.album || title,
            genre: t.genre,
            url: t.url,
        }));
        return (
        <TouchableOpacity style={styles.songRow} onPress={() => {
            navigation.navigate('SongDetail', {
                song: {
                    title: item.title,
                    artist: item.artist || title,
                    artwork: item.artwork || 'https://picsum.photos/seed/song/400',
                    duration: item.duration,
                    likes: item.play_count || 0,
                    album: item.album || title,
                    genre: item.genre,
                    url: item.url,
                },
                playlist: playlistData,
                currentIndex: index,
            });
        }}>
            <View style={styles.songNumberCircle}>
                <Text style={styles.songNumberText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.songMeta} numberOfLines={1}>{item.artist || title}</Text>
            </View>
            <Text style={styles.songDuration}>{item.duration}</Text>
            <TouchableOpacity
                onPress={() => playSingleSong(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Icon
                    name={playingSongId === item.id && isPlaying ? 'pause-circle' : 'play-circle'}
                    size={28}
                    color={playingSongId === item.id && isPlaying ? '#1DB954' : '#B3B3B3'}
                />
            </TouchableOpacity>
        </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Icon name="chevron-back" size={26} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Icon name="ellipsis-horizontal" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={[styles.bannerWrap, { backgroundColor: color }]}>
                    <View style={styles.bannerCircle}>
                        <Text style={styles.bannerEmoji}>{emoji}</Text>
                    </View>
                    <Text style={styles.bannerTitle}>{title}</Text>
                    {subtitle ? <Text style={styles.bannerSubtitle}>{subtitle}</Text> : null}
                    <Text style={styles.bannerMeta}>
                        {trackList.length} songs • {totalDurationStr}
                    </Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.shuffleBtn}>
                            <Icon name="shuffle" size={18} color="#FFFFFF" />
                            <Text style={styles.shuffleText}>Shuffle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.playAllBtn} onPress={playPlaylist}>
                            <Icon
                                name={isPlaying && playingSongId === trackList[0]?.id ? 'pause' : 'play'}
                                size={20} color="#FFFFFF"
                            />
                            <Text style={styles.playAllText}>
                                {isPlaying && playingSongId === trackList[0]?.id ? 'Pause' : 'Play All'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.favBtn}>
                            <Icon name="heart-outline" size={22} color="#1DB954" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.listWrap}>
                    <FlatList
                        data={trackList}
                        keyExtractor={(item: any, idx: number) => item.id || String(idx)}
                        renderItem={renderSong}
                        ItemSeparatorComponent={() => <View style={styles.songDivider} />}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No songs in this list yet.</Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    },
    iconButton: {
        width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
        borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        color: '#FFFFFF', fontSize: 17, fontWeight: '700', flex: 1,
        textAlign: 'center', marginHorizontal: 12,
    },
    bannerWrap: {
        alignItems: 'center', paddingTop: 28, paddingBottom: 24, paddingHorizontal: 20,
        marginHorizontal: 16, borderRadius: 18, marginTop: 8,
    },
    bannerCircle: {
        width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    },
    bannerEmoji: { fontSize: 48 },
    bannerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
    bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500', marginTop: 2 },
    bannerMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8 },
    actionRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18, gap: 10,
    },
    shuffleBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)',
        paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, gap: 6,
    },
    shuffleText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    playAllBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#000000',
        paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, gap: 6,
    },
    playAllText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    favBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center', alignItems: 'center',
    },
    listWrap: { marginTop: 24, paddingHorizontal: 20 },
    songRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    songNumberCircle: {
        width: 34, height: 34, borderRadius: 17, backgroundColor: '#1E1E1E',
        justifyContent: 'center', alignItems: 'center',
    },
    songNumberText: { color: '#B3B3B3', fontSize: 13, fontWeight: '700' },
    songTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 3 },
    songMeta: { color: '#B3B3B3', fontSize: 12 },
    songDuration: { color: '#B3B3B3', fontSize: 12, marginRight: 6 },
    songDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
    emptyState: { alignItems: 'center', padding: 30 },
    emptyText: { color: '#B3B3B3', fontSize: 14 },
});

export default PlaylistDetailScreen;
