import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    StatusBar,
    Image,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/AuthContext';
import {
    launchCamera,
    launchImageLibrary,
    CameraOptions,
    ImagePickerResponse,
    ImageLibraryOptions,
} from 'react-native-image-picker';
import { colors } from '../../theme/Colors';

const ProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { logout, userData: authUserData } = useAuth();
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

    const userData = {
        name: authUserData?.userName || 'John Doe',
        email: authUserData?.userEmail || 'john@example.com',
        joinDate: 'Joined January 2024',
        followers: '1.2K',
        following: '356',
        tracks: '24',
    };

    const requestAndroidPermission = async (type: 'camera' | 'gallery'): Promise<boolean> => {
        try {
            if (Platform.OS !== 'android') {
                return true;
            }

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
        Alert.alert(
            'Profile Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: () => openCamera() },
                { text: 'Choose from Gallery', onPress: () => openGallery() },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };

    const openCamera = async () => {
        try {
            setIsUploading(true);
            if (Platform.OS === 'android') {
                const hasPermission = await requestAndroidPermission('camera');
                if (!hasPermission) {
                    Alert.alert(
                        'Permission Required',
                        'Camera permission is required to take photos.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() }
                        ]
                    );
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
            Alert.alert('Error', 'Could not open camera. Please try again.');
            setIsUploading(false);
        }
    };

    const openGallery = async () => {
        try {
            setIsUploading(true);
            if (Platform.OS === 'android') {
                const hasPermission = await requestAndroidPermission('gallery');
                if (!hasPermission) {
                    Alert.alert(
                        'Permission Required',
                        'Storage permission is required to select photos.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() }
                        ]
                    );
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
            Alert.alert('Error', 'Could not open gallery. Please try again.');
            setIsUploading(false);
        }
    };

    const handleImageResponse = async (response: ImagePickerResponse) => {
        try {
            if (response.didCancel) {
                setIsUploading(false);
                return;
            }
            if (response.errorCode) {
                Alert.alert('Error', response.errorMessage || 'Failed to select image');
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
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await GoogleSignin.signOut();
                            await logout();
                        } catch (error) {
                            console.log('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const menuItems = [
        { id: '1', icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile' },
        { id: '2', icon: 'list-outline', label: 'My Playlists', screen: 'MyPlaylists' },
        { id: '3', icon: 'heart-outline', label: 'Likes', screen: 'LikedSongs' },
        { id: '4', icon: 'time-outline', label: 'Listening History', screen: 'RecentlyPlayed' },
        { id: '5', icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

            <View style={[styles.header, { marginTop: insets.top }]}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* <View style={styles.banner}>
                    <View style={styles.bannerOverlay} />
                </View> */}

                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={handleSelectImage} activeOpacity={0.8}>
                        {(profileImage || authUserData?.image) ? (
                            <Image source={{ uri: profileImage || authUserData?.image }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarInitials}>{getInitials(userData.name)}</Text>
                            </View>
                        )}
                        {isUploading && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            </View>
                        )}
                        <View style={styles.cameraBadge}>
                            <Icon name="camera" size={14} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userHandle}>@{userData.name.toLowerCase().replace(/\s+/g, '')}</Text>
                    {/* <Text style={styles.joinDate}>{userData.joinDate}</Text> */}
                </View>

                {/* <View style={styles.statsRow}>
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statValue}>{userData.followers}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </TouchableOpacity>
                    <View style={styles.statDivider} />
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statValue}>{userData.following}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </TouchableOpacity>
                    <View style={styles.statDivider} />
                    <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('MyPlaylists')}>
                        <Text style={styles.statValue}>{userData.tracks}</Text>
                        <Text style={styles.statLabel}>Playlists</Text>
                    </TouchableOpacity>
                </View> */}

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.primaryAction} activeOpacity={0.7} onPress={() => navigation.navigate('EditProfile')}>
                        <Icon name="create-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.primaryActionText}>Edit Profile</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.7} onPress={() => navigation.navigate('Settings')}>
                        <Icon name="settings-outline" size={18} color="#FFFFFF" />
                    </TouchableOpacity> */}
                </View>

                <View style={styles.menuGroup}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, index < menuItems.length - 1 && styles.menuSeparator]}
                            activeOpacity={0.6}
                            onPress={() => {
                                try {
                                    navigation.navigate(item.screen);
                                } catch {
                                    Alert.alert('Coming Soon', `${item.label} will be available soon.`);
                                }
                            }}
                        >
                            <Icon name={item.icon} size={22} color="#B3B3B3" />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Icon name="chevron-forward" size={20} color="#555" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
                    <Icon name="log-out-outline" size={20} color="#FF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        textAlign: 'center',
        color: colors.white,
        fontSize: 24,
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    banner: {
        height: 120,
        backgroundColor: '#1A1A1A',
        marginHorizontal: 0,
    },
    bannerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(29,185,84,0.15)',
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 20,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#0A0A0A',
    },
    avatarFallback: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0A0A0A',
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '700',
    },
    uploadOverlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0A0A0A',
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        marginTop: 14,
    },
    userHandle: {
        color: '#888',
        fontSize: 14,
        marginTop: 2,
    },
    joinDate: {
        color: '#555',
        fontSize: 12,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 40,
        marginTop: 24,
        backgroundColor: '#141414',
        borderRadius: 12,
        paddingVertical: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: '#888',
        fontSize: 11,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#2A2A2A',
    },
    actionsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        gap: 10,
    },
    primaryAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1DB954',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    primaryActionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    secondaryAction: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuGroup: {
        marginHorizontal: 20,
        marginTop: 28,
        backgroundColor: '#141414',
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    menuSeparator: {
        borderBottomWidth: 1,
        borderBottomColor: '#1E1E1E',
    },
    menuLabel: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        marginLeft: 14,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 24,
        paddingVertical: 14,
        backgroundColor: 'rgba(255,68,68,0.08)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        gap: 8,
    },
    logoutText: {
        color: '#FF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    version: {
        color: '#444',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 24,
    },
});

export default ProfileScreen;
