// screens/publicscreen/SignUpScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
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

const SignUpScreen = ({ navigation }: { navigation: any }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

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

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        };

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
            isValid = false;
        } else if (fullName.trim().length < 3) {
            newErrors.fullName = 'Name must be at least 3 characters';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignUp = () => {
        if (validateForm()) {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    'Success 🎉',
                    'Account created successfully! Please login.',
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
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
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
                                <Animated.View style={[styles.musicNote, styles.note3]}>
                                    <Icon name="musical-note" size={20} color="rgba(29, 185, 84, 0.25)" />
                                </Animated.View>
                            </View>

                            {/* Logo Section */}
                            <View style={styles.logoContainer}>
                                <View style={styles.logoCircle}>
                                    <Icon name="musical-notes" size={40} color="#1DB954" />
                                </View>
                                <Text style={styles.appName}>Melody</Text>
                            </View>

                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>
                                Start your musical journey with us
                            </Text>

                            <View style={styles.formContainer}>
                                <View style={styles.inputWrapper}>
                                    <View style={[styles.inputContainer, errors.fullName ? styles.inputError : null]}>
                                        <Icon name="person-outline" size={20} color="#1DB954" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Full Name"
                                            placeholderTextColor="#888"
                                            style={styles.input}
                                            value={fullName}
                                            onChangeText={(text) => {
                                                setFullName(text);
                                                if (errors.fullName) setErrors({ ...errors, fullName: '' });
                                            }}
                                        />
                                    </View>
                                    {errors.fullName ? (
                                        <Text style={styles.errorText}>{errors.fullName}</Text>
                                    ) : null}
                                </View>

                                <View style={styles.inputWrapper}>
                                    <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                                        <Icon name="mail-outline" size={20} color="#1DB954" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Email Address"
                                            placeholderTextColor="#888"
                                            style={styles.input}
                                            value={email}
                                            onChangeText={(text) => {
                                                setEmail(text);
                                                if (errors.email) setErrors({ ...errors, email: '' });
                                            }}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    {errors.email ? (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    ) : null}
                                </View>

                                <View style={styles.inputWrapper}>
                                    <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                                        <Icon name="lock-closed-outline" size={20} color="#1DB954" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Password"
                                            placeholderTextColor="#888"
                                            style={styles.input}
                                            value={password}
                                            onChangeText={(text) => {
                                                setPassword(text);
                                                if (errors.password) setErrors({ ...errors, password: '' });
                                            }}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeButton}
                                        >
                                            <Icon
                                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                                size={20}
                                                color="#888"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {errors.password ? (
                                        <Text style={styles.errorText}>{errors.password}</Text>
                                    ) : null}
                                </View>

                                <View style={styles.inputWrapper}>
                                    <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                                        <Icon name="lock-closed-outline" size={20} color="#1DB954" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Confirm Password"
                                            placeholderTextColor="#888"
                                            style={styles.input}
                                            value={confirmPassword}
                                            onChangeText={(text) => {
                                                setConfirmPassword(text);
                                                if (errors.confirmPassword) {
                                                    setErrors({ ...errors, confirmPassword: '' });
                                                }
                                            }}
                                            secureTextEntry={!showConfirmPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={styles.eyeButton}
                                        >
                                            <Icon
                                                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                                size={20}
                                                color="#888"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {errors.confirmPassword ? (
                                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                    ) : null}
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.signUpButton,
                                        (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || loading) &&
                                        styles.signUpButtonDisabled,
                                    ]}
                                    onPress={handleSignUp}
                                    disabled={!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#121212" />
                                    ) : (
                                        <>
                                            <Text style={styles.signUpButtonText}>Create Account</Text>
                                            <Icon name="arrow-forward" size={20} color="#121212" style={styles.signUpIcon} />
                                        </>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.divider} />
                                    <Text style={styles.dividerText}>or continue with</Text>
                                    <View style={styles.divider} />
                                </View>

                                {/* <View style={styles.socialContainer}>
                                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                                        <Icon name="logo-google" size={24} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                                        <Icon name="logo-apple" size={24} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                                        <Icon name="logo-facebook" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View> */}

                                <View style={styles.loginContainer}>
                                    <Text style={styles.loginText}>Already have an account? </Text>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Login')}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.loginLink}>Login</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    </ScrollView>
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
        paddingHorizontal: 24,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
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
    note3: {
        top: 150,
        left: 30,
        transform: [{ rotate: '25deg' }],
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
    eyeButton: {
        padding: 8,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    signUpButton: {
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
    signUpButtonDisabled: {
        backgroundColor: '#444',
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    signUpButtonText: {
        color: '#121212',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginRight: 8,
    },
    signUpIcon: {
        marginLeft: 4,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: '#888',
        fontSize: 13,
        marginHorizontal: 16,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 20,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#B3B3B3',
        fontSize: 15,
    },
    loginLink: {
        color: '#1DB954',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default SignUpScreen;