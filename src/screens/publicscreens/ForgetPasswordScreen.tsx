// screens/publicscreen/ForgotPasswordScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ImageBackground,
    Animated,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/Colors';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }: { navigation: any }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setError('Email is required');
            return false;
        } else if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        setError('');
        return true;
    };

    const handleSendResetLink = () => {
        if (validateEmail()) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    'Success! 🎵',
                    `Password reset link has been sent to:\n\n${email}\n\nPlease check your email inbox.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Login'),
                        },
                    ]
                );
            }, 1500);
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://i.pinimg.com/1200x/ef/21/e8/ef21e8efc9024fc0b2bdd4c32cdfa39d.jpg' }}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim }
                                ]
                            }
                        ]}
                    >
                        {/* Music Note Decorations */}
                        <View style={styles.decorationContainer}>
                            <Animated.View style={[styles.musicNote, styles.note1]}>
                                <Icon name="musical-note" size={24} color="rgba(29, 185, 84, 0.3)" />
                            </Animated.View>
                            <Animated.View style={[styles.musicNote, styles.note2]}>
                                <Icon name="musical-notes" size={32} color="rgba(29, 185, 84, 0.2)" />
                            </Animated.View>
                        </View>

                        {/* Logo Section */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Icon name="musical-notes" size={40} color="#1DB954" />
                            </View>
                            <Text style={styles.appName}>Melody</Text>
                        </View>

                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Enter your email address and we'll send you a link to reset your password.
                        </Text>

                        <View style={styles.formContainer}>
                            <View style={styles.inputWrapper}>
                                <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                                    <Icon name="mail-outline" size={20} color="#1DB954" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Email Address"
                                        placeholderTextColor="#888"
                                        style={styles.input}
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            if (error) setError('');
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                {error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : null}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (!email.trim() || loading) && styles.sendButtonDisabled,
                                ]}
                                onPress={handleSendResetLink}
                                disabled={!email.trim() || loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#121212" />
                                ) : (
                                    <>
                                        <Text style={styles.sendButtonText}>Send Reset Link</Text>
                                        <Icon name="arrow-forward" size={20} color="#121212" style={styles.sendIcon} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.backToLoginContainer}
                                onPress={() => navigation.navigate('Login')}
                                activeOpacity={0.7}
                            >
                                <Icon name="arrow-back" size={18} color="#1DB954" />
                                <Text style={styles.backToLoginText}> Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        paddingVertical: 20,
    },
    decorationContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    musicNote: {
        position: 'absolute',
        opacity: 0.3,
    },
    note1: {
        top: 20,
        right: 20,
        transform: [{ rotate: '15deg' }],
    },
    note2: {
        bottom: 100,
        left: 10,
        transform: [{ rotate: '-10deg' }],
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1DB954',
        marginBottom: 12,
    },
    appName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 2,
    },
    title: {
        color: colors.white,
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        color: '#B3B3B3',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    formContainer: {
        width: '100%',
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 56,
        color: colors.white,
        fontSize: 16,
        paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    },
    inputError: {
        borderColor: '#FF6B6B',
        borderWidth: 2,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    sendButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#1DB954',
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    sendButtonDisabled: {
        backgroundColor: '#444',
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    sendButtonText: {
        color: '#121212',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginRight: 8,
    },
    sendIcon: {
        marginLeft: 4,
    },
    backToLoginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    backToLoginText: {
        color: '#1DB954',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;