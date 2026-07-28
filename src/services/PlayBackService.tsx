import TrackPlayer, { Event } from 'react-native-track-player';

export const PlaybackService = async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        try {
            await TrackPlayer.play();
        } catch (e) {
            console.log('Playback error in play event:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemotePause, async () => {
        try {
            await TrackPlayer.pause();
        } catch (e) {
            console.log('Playback error in pause event:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        try {
            await TrackPlayer.skipToNext();
        } catch (e) {
            console.log('Playback error in next event:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        try {
            await TrackPlayer.skipToPrevious();
        } catch (e) {
            console.log('Playback error in previous event:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        try {
            await TrackPlayer.reset();
        } catch (e) {
            console.log('Playback error in stop event:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteDuck, async ({ paused }) => {
        try {
            if (paused) {
                await TrackPlayer.pause();
            }
        } catch (e) {
            console.log('Playback error in duck event:', e);
        }
    });
};