import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
type UserData = {
    userName: string;
    userEmail: string;
    image?: string;
    loginTime: string;
};

type AuthContextType = {
    isLoggedIn: boolean;
    userData: UserData | null;
    login: (userData: UserData) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                const data = JSON.parse(userDataString);
                setUserData(data);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.log('Check login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData: UserData) => {
        try {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            setUserData(userData);
            setIsLoggedIn(true);
        } catch (error) {
            console.log('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userData');
            setUserData(null);
            setIsLoggedIn(false);
        } catch (error) {
            console.log('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userData, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};