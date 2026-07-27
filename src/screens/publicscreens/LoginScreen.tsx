import React, { useState, useEffect, useRef } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
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
import { useAuth } from '../../context/AuthContext';

GoogleSignin.configure({
    webClientId:
        "384995844524-o1g198gl9l0q1sqj1jf4n6fi3esqn6c5.apps.googleusercontent.com",
    offlineAccess: true,
});
const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: { navigation: any }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });
    const { login } = useAuth();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    const VALID_EMAIL = 'kaif@example.com';
    const VALID_PASSWORD = '123456';

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
    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });

            await GoogleSignin.signOut();

            const response = await GoogleSignin.signIn();

            console.log("Google Response:", response);

            const user = response.data?.user;

            if (!user?.email) {
                Alert.alert(
                    "Google Login Failed",
                    "No user data received"
                );
                return;
            }

            const userData = {
                userName: user.name || "Google User",
                userEmail: user.email,
                image: user.photo || "",
                loginTime: new Date().toISOString(),
            };

            await login(userData);

        } catch (error: any) {
            console.log("Google Login Error Code:", error.code);
            console.log("Google Login Error:", error);

            Alert.alert(
                "Google Login Failed",
                error.message || "Something went wrong"
            );
        }
    };
    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: '', password: '' };

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

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        console.log('1. Login started');

        if (!email.trim() || !password.trim()) {
            console.log('2. Validation failed - empty fields');
            setErrors({
                email: !email.trim() ? 'Email is required' : '',
                password: !password.trim() ? 'Password is required' : '',
            });
            return;
        }

        if (!validateForm()) {
            console.log('3. Validation failed - invalid format');
            return;
        }

        if (email !== VALID_EMAIL) {
            console.log('4. Invalid email:', email);
            Alert.alert('Error', 'Invalid email. Use: kaif@example.com');
            return;
        }

        if (password !== VALID_PASSWORD) {
            console.log('5. Invalid password');
            Alert.alert('Error', 'Invalid password. Use: 123456');
            return;
        }

        console.log('6. Credentials valid, setting loading...');
        setLoading(true);

        try {
            const userData = {
                userName: email.split('@')[0],
                userEmail: email,
                loginTime: new Date().toISOString()
            };
            console.log('7. User data prepared:', userData);

            console.log('8. Calling login function...');
            await login(userData);
            console.log('9. Login successful! Navigation will happen automatically.');

        } catch (error) {
            console.log('10. Login Error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            console.log('11. Setting loading to false');
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp');
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

                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Icon name="musical-notes" size={40} color="#1DB954" />
                            </View>
                            <Text style={styles.appName}>Melody</Text>
                        </View>

                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>
                            Continue your musical journey with us
                        </Text>

                        <View style={styles.formContainer}>
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
                                        autoCorrect={false}
                                        autoComplete="off"
                                        importantForAutofill="no"
                                        textContentType="none"
                                        selectionColor="#1DB954"
                                        underlineColorAndroid="transparent"
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
                                        autoCorrect={false}
                                        autoComplete="off"
                                        importantForAutofill="no"
                                        textContentType="none"
                                        selectionColor="#1DB954"
                                        underlineColorAndroid="transparent"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                        activeOpacity={0.7}
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

                            <TouchableOpacity
                                style={styles.forgotPasswordContainer}
                                onPress={handleForgotPassword}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.loginButton,
                                    (!email.trim() || !password.trim() || loading) &&
                                    styles.loginButtonDisabled,
                                ]}
                                onPress={handleLogin}
                                disabled={!email.trim() || !password.trim() || loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#121212" />
                                ) : (
                                    <>
                                        <Text style={styles.loginButtonText}>Login</Text>
                                        <Icon name="arrow-forward" size={20} color="#121212" style={styles.loginIcon} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>& continue with</Text>
                                <View style={styles.divider} />
                            </View>

                            <View style={styles.socialContainer}>
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    activeOpacity={0.7}
                                    onPress={handleGoogleLogin}
                                >
                                    <Icon name="logo-google" size={24} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                                    <Icon name="logo-apple" size={24} color="#fff" />
                                </TouchableOpacity>
                                {/* <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                                    <Icon name="logo-facebook" size={24} color="#fff" />
                                </TouchableOpacity> */}
                            </View>

                            <View style={styles.signUpContainer}>
                                <Text style={styles.signUpText}>Don't have an account? </Text>
                                <TouchableOpacity
                                    onPress={handleSignUp}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.signUpLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginTop: 4,
    },
    forgotPasswordText: {
        color: '#1DB954',
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
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
    loginButtonDisabled: {
        backgroundColor: '#444',
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    loginButtonText: {
        color: '#121212',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginRight: 8,
    },
    loginIcon: {
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
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        color: '#B3B3B3',
        fontSize: 15,
    },
    signUpLink: {
        color: '#1DB954',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default LoginScreen;