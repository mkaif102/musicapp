import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
    FlatList,
    Animated,
    ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const slides = [
        {
            id: '1',
            title: 'Discover New Music',
            subtitle: 'Unlimited Music Experience',
            description:
                'Explore millions of songs, albums, and playlists from your favorite artists anytime, anywhere.',
            image:
                'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1080&q=80',
            color: '#1DB954',
        },
        {
            id: '2',
            title: 'Personalized For You',
            subtitle: 'Music That Matches Your Mood',
            description:
                'Get smart recommendations based on your listening habits and discover tracks you’ll love.',
            image:
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&q=80',
            color: '#1DB954',
        },
        {
            id: '3',
            title: 'Listen Anytime',
            subtitle: 'Create Your Perfect Playlist',
            description:
                'Save your favorite songs, build custom playlists, and enjoy your music journey without limits.',
            image:
                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1080&q=80',
            color: '#1DB954',
        },
    ];

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        setCurrentIndex(viewableItems[0]?.index || 0);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = () => {
        if (currentIndex < slides.length - 1) {
            // Move to next slide
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Last slide - Navigate to Login
            navigation.replace('Login');
        }
    };

    // Handle Skip button - Navigate directly to Login
    const handleSkip = () => {
        navigation.replace('Login');
    };

    // Handle Get Started from last slide
    const handleGetStarted = () => {
        navigation.replace('Login');
    };

    const renderSlide = ({ item }: { item: any }) => {
        const isLastSlide = currentIndex === slides.length - 1;

        return (
            <View style={styles.slideContainer}>
                <ImageBackground
                    source={{ uri: item.image }}
                    style={styles.fullScreenImage}
                    resizeMode="cover"
                >
                    <View style={styles.overlay}>
                        <View style={styles.topSection}>
                            <View style={[styles.iconCircle, { borderColor: item.color }]}>
                                <Icon name="musical-notes" size={40} color={item.color} />
                            </View>
                        </View>

                        <View style={styles.middleSection}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>
                                    <Text style={styles.titleFirst}>{item.title.split(' ')[0]} </Text>
                                    <Text style={[styles.titleSecond, { color: item.color }]}>
                                        {item.title.split(' ').slice(1).join(' ')}
                                    </Text>
                                </Text>
                            </View>

                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>

                        <View style={styles.bottomSection}>
                            <View style={styles.paginationContainer}>
                                {slides.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.paginationDot,
                                            {
                                                backgroundColor:
                                                    index === currentIndex
                                                        ? item.color
                                                        : 'rgba(255,255,255,0.3)',
                                                width: index === currentIndex ? 30 : 8,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={handleSkip}
                                >
                                    <Text style={styles.skipText}>Skip</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.nextButton, { backgroundColor: item.color }]}
                                    onPress={scrollTo}
                                >
                                    <Text style={styles.nextText}>
                                        {isLastSlide ? 'Get Started' : 'Next'}
                                    </Text>
                                    <Icon
                                        name={isLastSlide ? 'arrow-forward' : 'chevron-forward'}
                                        size={18}
                                        color="#121212"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <FlatList
                ref={slidesRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                scrollEventThrottle={32}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    slideContainer: {
        width: width,
        height: height,
    },
    fullScreenImage: {
        width: width,
        height: height,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 40,
    },
    topSection: {
        flex: 0.55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginTop: 20,
    },
    middleSection: {
        flex: 0.9,
        justifyContent: 'center',
    },
    titleContainer: {
        marginBottom: 8,
    },
    title: {
        fontSize: 40,
        fontWeight: '700',
        lineHeight: 48,
        textAlign: 'center',
    },
    titleFirst: {
        color: colors.white,
        textAlign: 'center',
    },
    titleSecond: {
        color: '#1DB954',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '500',
        color: colors.white,
        marginBottom: 12,
    },
    description: {
        textAlign: 'center',
        fontSize: 15,
        color: colors.white,
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    bottomSection: {
        flex: 0.5,
        justifyContent: 'flex-end',
        paddingBottom: 10,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        height: 20,
        marginBottom: 16,
    },
    paginationDot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    skipButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        marginBottom: 50
    },
    skipText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '500',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        flex: 1,
        gap: 8,
        marginBottom: 50
    },
    nextText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OnboardingScreen;