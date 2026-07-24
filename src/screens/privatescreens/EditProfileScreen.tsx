import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image,
    PermissionsAndroid,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/Colors';
import {
    launchCamera,
    launchImageLibrary,
    CameraOptions,
    ImagePickerResponse,
    ImageLibraryOptions,
} from 'react-native-image-picker';

const EditProfileScreen = ({ navigation, route }: any) => {
    const { userData: authUserData, login } = useAuth();

    // Get user data from route params or auth context
    const initialName = route?.params?.userName || authUserData?.userName || 'John Doe';
    const initialEmail = route?.params?.userEmail || authUserData?.userEmail || 'john.doe@example.com';

    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [bio, setBio] = useState('React Native Developer | Music Lover');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ name: '', email: '' });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadProfileImage();
    }, []);

    const loadProfileImage = async () => {
        try {
            const savedImage = await AsyncStorage.getItem('profileImage');
            if (savedImage) {
                setProfileImage(savedImage);
            }
        } catch (error) {
            console.log('Error loading profile image:', error);
        }
    };

    // Get user's initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: '', email: '' };

        if (!name.trim()) {
            newErrors.name = 'Name is required';
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

        setErrors(newErrors);
        return isValid;
    };

    const requestAndroidPermission = async (type: 'camera' | 'gallery'): Promise<boolean> => {
        try {
            if (Platform.OS !== 'android') return true;

            if (type === 'camera') {
                const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
                const hasPermission = await PermissionsAndroid.check(permission);
                if (!hasPermission) {
                    const result = await PermissionsAndroid.request(permission, {
                        title: 'Camera Permission',
                        message: 'This app needs access to your camera to take profile photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    });
                    return result === PermissionsAndroid.RESULTS.GRANTED;
                }
                return true;
            } else {
                if (Platform.Version >= 33) {
                    const permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
                    const hasPermission = await PermissionsAndroid.check(permission);
                    if (!hasPermission) {
                        const result = await PermissionsAndroid.request(permission, {
                            title: 'Storage Permission',
                            message: 'This app needs access to your photos to select profile pictures.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        });
                        return result === PermissionsAndroid.RESULTS.GRANTED;
                    }
                    return true;
                } else {
                    const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
                    const hasPermission = await PermissionsAndroid.check(permission);
                    if (!hasPermission) {
                        const result = await PermissionsAndroid.request(permission, {
                            title: 'Storage Permission',
                            message: 'This app needs access to your photos to select profile pictures.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        });
                        return result === PermissionsAndroid.RESULTS.GRANTED;
                    }
                    return true;
                }
            }
        } catch (err) {
            console.warn('Permission error:', err);
            return false;
        }
    };

    const handleSelectImage = () => {
        Alert.alert('Profile Photo', 'Choose an option', [
            { text: 'Take Photo', onPress: () => openCamera() },
            { text: 'Choose from Gallery', onPress: () => openGallery() },
            { text: 'Cancel', style: 'cancel' },
        ], { cancelable: true });
    };

    const openCamera = async () => {
        try {
            setIsUploading(true);
            if (Platform.OS === 'android') {
                const hasPermission = await requestAndroidPermission('camera');
                if (!hasPermission) {
                    Alert.alert('Permission Required', 'Camera permission is required.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]);
                    setIsUploading(false);
                    return;
                }
            }
            const options: CameraOptions = {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 800,
                maxWidth: 800,
                quality: 0.8,
                saveToPhotos: false,
            };
            launchCamera(options, handleImageResponse);
        } catch (error) {
            console.log('Camera error:', error);
            Alert.alert('Error', 'Could not open camera.');
            setIsUploading(false);
        }
    };

    const openGallery = async () => {
        try {
            setIsUploading(true);
            if (Platform.OS === 'android') {
                const hasPermission = await requestAndroidPermission('gallery');
                if (!hasPermission) {
                    Alert.alert('Permission Required', 'Storage permission is required.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]);
                    setIsUploading(false);
                    return;
                }
            }
            const options: ImageLibraryOptions = {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 800,
                maxWidth: 800,
                quality: 0.8,
                selectionLimit: 1,
            };
            launchImageLibrary(options, handleImageResponse);
        } catch (error) {
            console.log('Gallery error:', error);
            Alert.alert('Error', 'Could not open gallery.');
            setIsUploading(false);
        }
    };

    const handleImageResponse = async (response: ImagePickerResponse) => {
        try {
            if (response.didCancel || response.errorCode) {
                setIsUploading(false);
                return;
            }
            if (response.assets && response.assets.length > 0) {
                const imageUri = response.assets[0].uri;
                if (imageUri) {
                    setProfileImage(imageUri);
                    await AsyncStorage.setItem('profileImage', imageUri);
                }
            }
        } catch (error) {
            console.log('Image selection error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const existingData = await AsyncStorage.getItem('userData');
            const userData = existingData ? JSON.parse(existingData) : {};

            const updatedUserData = {
                ...userData,
                userName: name.trim(),
                userEmail: email.trim(),
                userBio: bio.trim(),
                lastUpdated: new Date().toISOString(),
            };

            await AsyncStorage.setItem(
                'userData',
                JSON.stringify(updatedUserData)
            );

            await login(updatedUserData);

            // Save ke baad Profile Screen par jana
            navigation.navigate('Profile', {
                userName: name.trim(),
                userEmail: email.trim(),
            });

        } catch (error) {
            console.log('Save error:', error);

            Alert.alert(
                'Error',
                'Failed to save profile. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Profile</Text>
                    <View style={styles.placeholderView} />
                </View>

                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {(profileImage || authUserData?.image) ? (
                            <Image source={{ uri: profileImage || authUserData?.image }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{getInitials(name)}</Text>
                        )}
                        {isUploading && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator size="large" color="#1DB954" />
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.changePhotoButton}
                        activeOpacity={0.7}
                        onPress={handleSelectImage}
                        disabled={isUploading}
                    >
                        <Icon name="camera-outline" size={18} color="#1DB954" />
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            placeholder="Enter your full name"
                            style={[styles.input, errors.name ? styles.inputError : null]}
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            placeholderTextColor="#666"
                        />
                        {errors.name ? (
                            <Text style={styles.errorText}>{errors.name}</Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            placeholder="Enter your email"
                            style={[styles.input, errors.email ? styles.inputError : null]}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#666"
                        />
                        {errors.email ? (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            placeholder="Tell us about yourself"
                            style={[styles.input, styles.bioInput]}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#666"
                            maxLength={150}
                        />
                        <Text style={styles.charCount}>{bio.length}/150</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {
                            // loading ? (
                            //     <ActivityIndicator color="#121212" />
                            // ) :
                            (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>


            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: colors.white,
    },
    placeholderView: {
        width: 44,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2C2C2C',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#1DB954',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.white,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        resizeMode: 'cover',
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 6,
        paddingHorizontal: 16,
        gap: 8,
    },
    changePhotoText: {
        color: '#1DB954',
        fontSize: 15,
        fontWeight: '600',
    },
    formSection: {
        marginTop: 10,
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#B3B3B3',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: '#2C2C2C',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 16 : 12,
        fontSize: 16,
        color: colors.white,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    inputError: {
        borderColor: '#colors',
        borderWidth: 2,
    },
    errorText: {
        color: '#colors',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    bioInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    charCount: {
        textAlign: 'right',
        color: '#666',
        fontSize: 12,
        marginTop: 5,
    },
    saveButton: {
        backgroundColor: '#1DB954',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#121212',
        fontWeight: '700',
        fontSize: 17,
        letterSpacing: 0.5,
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    footerText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 13,
        marginTop: 30,
        letterSpacing: 0.3,
    },
});

export default EditProfileScreen;