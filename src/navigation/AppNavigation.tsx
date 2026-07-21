// src/navigation/AppNavigation.tsx
import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/privatescreens/HomeScreen';
import ProfileScreen from '../screens/privatescreens/ProfileScreen';
import SettingsScreen from '../screens/privatescreens/SettingsScreen';
import EditProfileScreen from '../screens/privatescreens/EditProfileScreen';
import NotificationScreen from '../screens/privatescreens/NotificationScreen';
import MyPlaylistsScreen from '../screens/privatescreens/MyPlaylistsScreen';
import FavoritesScreen from '../screens/privatescreens/FavoritesScreen';
import HistoryScreen from '../screens/privatescreens/HistoryScreen';
import HelpSupportScreen from '../screens/privatescreens/HelpSupportScreen';
import FAQsListScreen from '../screens/privatescreens/FAQsListScreen';
import ArtistDetailScreen from '../screens/privatescreens/ArtistDetailScreen';
import PlaylistDetailScreen from '../screens/privatescreens/PlaylistDetailScreen';
import RecentlyPlayedScreen from '../screens/privatescreens/RecentlyPlayedScreen';
import SearchScreen from '../screens/privatescreens/SearchScreen';
import HelpCenterScreen from '../screens/privatescreens/HelpCenterScreen';
import PrivacyPolicyScreen from '../screens/privatescreens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/privatescreens/TermsOfServiceScreen';
import ChatScreen from '../screens/privatescreens/ChatScreen';
import LoginScreen from '../screens/publicscreens/LoginScreen';
import SignUpScreen from '../screens/publicscreens/SignUpScreen';
import ForgotPasswordScreen from '../screens/publicscreens/ForgetPasswordScreen';
import SplashScreen from '../screens/publicscreens/SplashScreen';
import { useAuth } from '../context/AuthContext';
import SongDetailScreen from '../screens/privatescreens/SongDetailScreen';
import OnboardingScreen from '../screens/publicscreens/OnBoardingScreen';
import MiniPlayer from '../components/MiniPlayer';
import RadioScreen from '../screens/privatescreens/RadioScreen';
import LikedSongsScreen from '../screens/privatescreens/LikedSongsScreen';

const AuthStack = createNativeStackNavigator();
const LoggedInStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
        <View style={{ flex: 1 }}>
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#121212',
                    borderTopColor: 'rgba(255,255,255,0.05)',
                    paddingBottom: 10,
                    paddingTop: 10,
                    height: 70,
                },
                tabBarActiveTintColor: '#1DB954',
                tabBarInactiveTintColor: '#666',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = '';
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    } else if (route.name === 'Playlists') {
                        iconName = focused ? 'musical-notes' : 'musical-notes-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Icon name={iconName} size={size || 24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
            <Tab.Screen name="Playlists" component={MyPlaylistsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
        <MiniPlayer />
        </View>
    );
};

const AuthNavigator = () => (
    <AuthStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
        }}
    >
        <AuthStack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
        <AuthStack.Screen name="OnBoarding" component={OnboardingScreen} />
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
);

const LoggedInNavigator = () => (
    <LoggedInStack.Navigator
        screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
        }}
    >
        <LoggedInStack.Screen name="MainTabs" component={MainTabs} />
        <LoggedInStack.Screen name="EditProfile" component={EditProfileScreen} />
        <LoggedInStack.Screen name="MyPlaylists" component={MyPlaylistsScreen} />
        <LoggedInStack.Screen name="Favorites" component={FavoritesScreen} />
        <LoggedInStack.Screen name="History" component={HistoryScreen} />
        <LoggedInStack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <LoggedInStack.Screen name="FAQsList" component={FAQsListScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="ArtistDetail" component={ArtistDetailScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="RecentlyPlayed" component={RecentlyPlayedScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="SongDetail" component={SongDetailScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="Radio" component={RadioScreen} options={{ headerShown: false }} />
        <LoggedInStack.Screen name="LikedSongs" component={LikedSongsScreen} options={{ headerShown: false }} />
    </LoggedInStack.Navigator>
);

const AppNavigation = () => {
    const { isLoggedIn, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <View style={{ flex: 1 }}>
            {isLoggedIn ? <LoggedInNavigator key="loggedIn" /> : <AuthNavigator key="auth" />}
        </View>
    );
};

export default AppNavigation;
