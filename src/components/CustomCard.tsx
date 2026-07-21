import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/Colors';

interface CustomCardProps {
    icon: string;
    title: string;
    description: string;
    buttonText: string;
    onPress?: () => void;
}

const CustomCard: React.FC<CustomCardProps> = ({
    icon,
    title,
    description,
    buttonText,
    onPress,
}) => {
    return (
        <View style={styles.card}>

            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
            </View>

            <Text style={styles.title}>{title}</Text>

            <Text style={styles.description}>
                {description}
            </Text>

            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.button}
                onPress={onPress}
            >
                <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>

        </View>
    );
};

export default CustomCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1B2333',
        borderRadius: 22,
        padding: 22,
        marginTop: 20,

        borderWidth: 1,
        borderColor: '#2C3B52',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,

        elevation: 8,
    },

    iconContainer: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#2F80ED20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },

    icon: {
        fontSize: 30,
    },

    title: {
        color: colors.white,
        fontSize: 22,
        fontWeight: '700',
    },

    description: {
        color: '#A8B0C0',
        fontSize: 15,
        lineHeight: 24,
        marginTop: 10,
        marginBottom: 22,
    },

    button: {
        backgroundColor: '#4F46E5',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },

    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});