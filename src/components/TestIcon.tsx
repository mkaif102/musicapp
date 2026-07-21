// src/components/TestIcon.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


const TestIcon = () => {
    return (
        <View style={styles.container}>
            <Icon name="home" size={50} color="#2a7de1" />
            <Text style={styles.text}>Icon Test - Working!</Text>

            {/* Test multiple icons */}
            <View style={styles.iconRow}>
                <Icon name="person" size={30} color="#2a7de1" />
                <Icon name="settings" size={30} color="#2a7de1" />
                <Icon name="notifications" size={30} color="#2a7de1" />
                <Icon name="star" size={30} color="#f5a623" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    text: {
        fontSize: 18,
        marginTop: 10,
        color: '#0b1e33',
    },
    iconRow: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 20,
        justifyContent: 'space-around',
        width: '60%',
    },
});

export default TestIcon;