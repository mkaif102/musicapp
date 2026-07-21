import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/Colors';

const SettingsScreen = ({ navigation }: any) => {
    const { userData, logout } = useAuth();
    const [userName, setUserName] = useState('John Doe');
    const [userEmail, setUserEmail] = useState('john.doe@example.com');

    const [settings, setSettings] = useState({
        darkMode: false,
        notifications: true,
        sound: true,
        vibration: false,
        autoSave: true,
        location: false,
        analytics: true,
    });

    useEffect(() => {
        if (userData) {
            setUserName(userData.userName || 'John Doe');
            setUserEmail(userData.userEmail || 'john.doe@example.com');
        }
    }, [userData]);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('userData');
                            await logout();
                            Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
                        } catch (error) {
                            console.log('Delete account error:', error);
                            Alert.alert('Error', 'Failed to delete account. Please try again.');
                        }
                    }
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{userName}</Text>
                            <Text style={styles.profileEmail}>{userEmail}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => navigation.navigate('EditProfile', { userName, userEmail })}
                            activeOpacity={0.7}
                        >
                            <Icon name="create-outline" size={18} color="#1DB954" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>ACCOUNT</Text>
                    <View style={styles.listGroup}>
                        <TouchableOpacity style={styles.listItem} activeOpacity={0.6} onPress={() => Alert.alert('Coming Soon', 'Subscription management coming soon.')}>
                            <Icon name="card-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Subscription</Text>
                            <Icon name="chevron-forward" size={20} color="#555" />
                        </TouchableOpacity>
                        <View style={styles.listSeparator} />
                        <TouchableOpacity style={styles.listItem} activeOpacity={0.6} onPress={() => navigation.navigate('HelpCenter')}>
                            <Icon name="cloud-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Storage & Data</Text>
                            <Icon name="chevron-forward" size={20} color="#555" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionLabel}>PREFERENCES</Text>
                    <View style={styles.listGroup}>
                        <View style={styles.listItem}>
                            <Icon name="notifications-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Notifications</Text>
                            <Switch
                                value={settings.notifications}
                                onValueChange={() => toggleSetting('notifications')}
                                trackColor={{ false: '#2C2C2C', true: '#1DB954' }}
                                thumbColor={settings.notifications ? '#FFFFFF' : '#666'}
                                ios_backgroundColor="#2C2C2C"
                            />
                        </View>
                        <View style={styles.listSeparator} />
                        <View style={styles.listItem}>
                            <Icon name="volume-high-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Playback Sound</Text>
                            <Switch
                                value={settings.sound}
                                onValueChange={() => toggleSetting('sound')}
                                trackColor={{ false: '#2C2C2C', true: '#1DB954' }}
                                thumbColor={settings.sound ? '#FFFFFF' : '#666'}
                                ios_backgroundColor="#2C2C2C"
                            />
                        </View>
                        <View style={styles.listSeparator} />
                        <View style={styles.listItem}>
                            <Icon name="phone-portrait-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Vibration</Text>
                            <Switch
                                value={settings.vibration}
                                onValueChange={() => toggleSetting('vibration')}
                                trackColor={{ false: '#2C2C2C', true: '#1DB954' }}
                                thumbColor={settings.vibration ? '#FFFFFF' : '#666'}
                                ios_backgroundColor="#2C2C2C"
                            />
                        </View>
                        <View style={styles.listSeparator} />
                        <View style={styles.listItem}>
                            <Icon name="moon-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Dark Mode</Text>
                            <Switch
                                value={settings.darkMode}
                                onValueChange={() => toggleSetting('darkMode')}
                                trackColor={{ false: '#2C2C2C', true: '#1DB954' }}
                                thumbColor={settings.darkMode ? '#FFFFFF' : '#666'}
                                ios_backgroundColor="#2C2C2C"
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionLabel}>PRIVACY</Text>
                    <View style={styles.listGroup}>
                        <View style={styles.listItem}>
                            <Icon name="location-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Location Services</Text>
                            <Switch
                                value={settings.location}
                                onValueChange={() => toggleSetting('location')}
                                trackColor={{ false: '#2C2C2C', true: '#1DB954' }}
                                thumbColor={settings.location ? '#FFFFFF' : '#666'}
                                ios_backgroundColor="#2C2C2C"
                            />
                        </View>
                        <View style={styles.listSeparator} />
                        <TouchableOpacity style={styles.listItem} activeOpacity={0.6} onPress={() => Alert.alert('Coming Soon', '2FA will be available in the next update')}>
                            <Icon name="shield-checkmark-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Two-Factor Authentication</Text>
                            <Icon name="chevron-forward" size={20} color="#555" />
                        </TouchableOpacity>
                        <View style={styles.listSeparator} />
                        <View style={styles.listItem}>
                            <Icon name="bar-chart-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Usage Analytics</Text>
                            <Switch
                                value={settings.analytics}
                                onValueChange={() => toggleSetting('analytics')}
                                trackColor={{ false: '#2C2C2C', true: '#1DB954' }}
                                thumbColor={settings.analytics ? '#FFFFFF' : '#666'}
                                ios_backgroundColor="#2C2C2C"
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionLabel}>SUPPORT</Text>
                    <View style={styles.listGroup}>
                        <TouchableOpacity style={styles.listItem} activeOpacity={0.6} onPress={() => Alert.alert('Contact Us', 'Opening email...')}>
                            <Icon name="mail-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Contact Us</Text>
                            <Icon name="chevron-forward" size={20} color="#555" />
                        </TouchableOpacity>
                        <View style={styles.listSeparator} />
                        <TouchableOpacity style={styles.listItem} activeOpacity={0.6} onPress={() => navigation.navigate('PrivacyPolicy')}>
                            <Icon name="document-text-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Privacy Policy</Text>
                            <Icon name="chevron-forward" size={20} color="#555" />
                        </TouchableOpacity>
                        <View style={styles.listSeparator} />
                        <TouchableOpacity style={styles.listItem} activeOpacity={0.6} onPress={() => navigation.navigate('TermsOfService')}>
                            <Icon name="document-outline" size={22} color="#B3B3B3" />
                            <Text style={styles.listItemText}>Terms of Service</Text>
                            <Icon name="chevron-forward" size={20} color="#555" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dangerZone}>
                        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.7} onPress={handleDeleteAccount}>
                            <Icon name="trash-outline" size={18} color="#FF4444" />
                            <Text style={styles.deleteText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
        marginTop: 50,
        textAlign: 'center',
        flex: 1
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: '#141414',
        padding: 16,
        borderRadius: 12,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    profileEmail: {
        color: '#888',
        fontSize: 13,
    },
    editBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(29,185,84,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#1A1A1A',
        marginVertical: 20,
        marginHorizontal: 20,
    },
    sectionLabel: {
        color: '#666',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginHorizontal: 20,
        marginBottom: 8,
        marginTop: 4,
    },
    listGroup: {
        marginHorizontal: 20,
        backgroundColor: '#141414',
        borderRadius: 12,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    listItemText: {
        flex: 1,
        color: colors.white,
        fontSize: 15,
        fontWeight: '400',
        marginLeft: 14,
    },
    listSeparator: {
        height: 1,
        backgroundColor: '#1E1E1E',
        marginLeft: 52,
    },
    dangerZone: {
        marginTop: 32,
        marginHorizontal: 20,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        gap: 6,
    },
    deleteText: {
        color: '#FF4444',
        fontSize: 14,
        fontWeight: '500',
    },
    version: {
        color: '#444',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 24,
    },
});

export default SettingsScreen;
