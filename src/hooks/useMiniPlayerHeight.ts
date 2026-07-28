import { useActiveTrack } from 'react-native-track-player';
import { MINI_PLAYER_HEIGHT } from '../components/MiniPlayer';

export const useMiniPlayerHeight = (): number => {
    const activeTrack = useActiveTrack();
    return activeTrack ? MINI_PLAYER_HEIGHT : 0;
};
