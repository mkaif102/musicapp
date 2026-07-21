import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from "react-native";
import { colors } from "../../theme/Colors";

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }: any) => {

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const dotAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const hasNavigated = useRef(false);


    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                useNativeDriver: true,
            })
        ).start();

        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),

            Animated.loop(
                Animated.sequence([

                    Animated.timing(dotAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),

                    Animated.timing(dotAnim, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            )
        ]).start();

        const timer = setTimeout(() => {
            if (hasNavigated.current) return;
            hasNavigated.current = true;
            navigation.replace('OnBoarding');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>

            {/* Background Circles */}
            <View style={styles.gradientOverlay}>
                <View style={styles.gradientCircle1} />
                <View style={styles.gradientCircle2} />
            </View>

            {/* Logo */}
            <Animated.View
                style={[
                    styles.logoContainer,

                    {
                        transform: [
                            {
                                scale: scaleAnim
                            },

                            {
                                rotate: rotate
                            }

                        ],
                        opacity: opacityAnim,
                    }

                ]}

            >
                <Text style={styles.logoIcon}>
                    🎵
                </Text>
            </Animated.View>

            {/* App Name */}
            <Animated.View
                style={{
                    opacity: opacityAnim,
                    alignItems: 'center',
                }}

            >
                <Text style={styles.appName}>
                    Music
                    <Text style={styles.appNameHighlight}>
                        App
                    </Text>
                </Text>
                <Text style={styles.tagline}>
                    Your Music, Your Way
                </Text>
            </Animated.View>

            {/* Loading Dots */}
            <View style={styles.loadingContainer}>

                <Animated.View
                    style={[
                        styles.dot,
                        {
                            opacity: dotAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1]
                            }),
                            transform: [
                                {
                                    scale: dotAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1.2]
                                    })
                                }
                            ]
                        }
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        {
                            opacity: dotAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0.3]
                            }),
                            transform: [
                                {
                                    scale: dotAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1.2]

                                    })
                                }
                            ]
                        }
                    ]}
                />

                <Animated.View
                    style={[
                        styles.dot,
                        {
                            opacity: dotAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1]
                            }),
                            transform: [
                                {
                                    scale: dotAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1.2, 0.8]

                                    })
                                }
                            ]
                        }
                    ]}
                />
            </View>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black || '#121212',
        justifyContent: "center",
        alignItems: "center",
    },

    gradientOverlay: {
        position: 'absolute',
        width,
        height,
        overflow: 'hidden',
    },

    gradientCircle1: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: colors.green || '#1DB954',
        opacity: 0.03,
        top: -width * 0.3,
        right: -width * 0.2,
    },


    gradientCircle2: {
        position: 'absolute',
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: colors.green || '#1DB954',
        opacity: 0.02,
        bottom: -width * 0.2,
        left: -width * 0.2,
    },

    logoContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.green || '#1DB954',
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.green || '#1DB954',
        shadowOpacity: 0.3,
        shadowRadius: 25,
        elevation: 20,
        marginBottom: 30,
    },

    logoIcon: {
        fontSize: 70,
    },

    appName: {
        fontSize: 38,
        fontWeight: "800",
        color: colors.white || '#FFFFFF',
        textAlign: "center",
        letterSpacing: 1.5,
    },

    appNameHighlight: {
        color: colors.green || '#1DB954',
    },

    tagline: {
        marginTop: 10,
        fontSize: 16,
        color: colors.grey || '#B3B3B3',
        textAlign: "center",
        letterSpacing: 0.5,
    },


    loadingContainer: {
        position: "absolute",
        bottom: 100,
        flexDirection: "row",
        gap: 12,
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.green || '#1DB954',
    },
});
export default SplashScreen;