import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  Event,
} from 'react-native-track-player';

import AppNavigation from './src/navigation/AppNavigation';
import { AuthProvider } from './src/context/AuthContext';
import { saveToRecentlyPlayed } from './src/utils/recentlyPlayed';

const App = () => {
  useEffect(() => {
    let isCancelled = false;

    const setup = async () => {
      try {
        await TrackPlayer.setupPlayer({});
        if (isCancelled) return;
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
          ],
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
        });

        // TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
        //   const track = event.track;
        //   if (track) {
        //     await saveToRecentlyPlayed({
        //       id: track.id || 'unknown',
        //       title: track.title || 'Unknown',
        //       artist: track.artist || 'Unknown Artist',
        //       album: (track as any).album || '',
        //       duration: track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '0:00',
        //       url: track.url || '',
        //       artwork: (typeof track.artwork === 'string' ? track.artwork : (track.artwork as any)?.uri) || 'https://picsum.photos/seed/song/400',
        //     });
        //   }
        // });
        const trackListener = TrackPlayer.addEventListener(
          Event.PlaybackActiveTrackChanged,
          async (event) => {

            const track = event.track;

            if (track) {
              await saveToRecentlyPlayed({
                id: track.id || 'unknown',
                title: track.title || 'Unknown',
                artist: track.artist || 'Unknown Artist',
                album: (track as any).album || '',

                duration: track.duration
                  ? `${Math.floor(track.duration / 60)}:${String(
                    Math.floor(track.duration % 60)
                  ).padStart(2, '0')}`
                  : '0:00',

                url: track.url || '',

                artwork:
                  typeof track.artwork === 'string'
                    ? track.artwork
                    : (track.artwork as any)?.uri ||
                    'https://picsum.photos/seed/song/400',
              });
            }

          }
        );
      } catch (error: any) {
        if (
          error?.code === 'player_already_initialized' ||
          error?.message?.includes('already been initialized')
        ) {
          return;
        }
        console.log('TrackPlayer setup error:', error);
      }
    };

    setup();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigation />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
