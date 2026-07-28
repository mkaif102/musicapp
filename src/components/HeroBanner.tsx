// src/components/home/HeroBanner.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/Colors';

interface HeroBannerProps {
    imageUrl: string;
    badgeIcon?: string;
    badgeText: string;
    badgeColor?: string;
    title: string;
    subtitle: string;
    buttonText: string;
    onPress: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
    imageUrl,
    badgeIcon = 'flash',
    badgeText,
    badgeColor = '#1DB954',
    title,
    subtitle,
    buttonText,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.heroBanner} activeOpacity={0.9} onPress={onPress}>
            <ImageBackground source={{ uri: imageUrl }} style={styles.heroBannerImage}>
                <View style={styles.heroOverlay}>
                    <View style={[styles.heroBadge, { backgroundColor: badgeColor + '22' }]}>
                        <Icon name={badgeIcon} size={12} color={badgeColor} style={{ marginRight: 4 }} />
                        <Text style={[styles.heroBadgeText, { color: badgeColor }]}>{badgeText}</Text>
                    </View>
                    <Text style={styles.heroTitle}>{title}</Text>
                    <Text style={styles.heroSubtitle}>{subtitle}</Text>
                    <View style={styles.heroActionContainer}>
                        <View style={styles.heroPlayButton}>
                            <Icon name="play-sharp" size={16} color="#000000" />
                            <Text style={styles.heroPlayText}>{buttonText}</Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    heroBanner: {
        height: 190,
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 12,
    },
    heroBannerImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        padding: 18,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    heroBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
    },
    heroSubtitle: {
        color: '#D0D0D0',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 14,
        fontWeight: '400',
    },
    heroActionContainer: {
        flexDirection: 'row',
    },
    heroPlayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
    },
    heroPlayText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 6,
    },
});

export default HeroBanner;