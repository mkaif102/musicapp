import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/privatescreens/HomeScreen';
import ProfileScreen from '../screens/privatescreens/ProfileScreen';
import SettingsScreen from '../screens/privatescreens/SettingsScreen';

import CustomHeader from './CustomHeader';
import TabIcon from './TabIcon';
import { colors } from '../theme/Colors';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: () => <CustomHeader title={route.name} />,

                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'home-outline';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    }
                    else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return (
                        <TabIcon
                            name={iconName}
                            size={size}
                            color={color}
                        />
                    );
                },

                tabBarActiveTintColor: colors.green,
                tabBarInactiveTintColor: '#8e9bb0',

                tabBarStyle: {
                    backgroundColor: colors.black,
                    height: 80,
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
            />

            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
            />

        </Tab.Navigator>
    );
};

export default BottomTabNavigator;