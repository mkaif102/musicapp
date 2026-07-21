import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/Colors';

interface IconTextItemProps {
    icon: string;
    text: string;
    iconSize?: number;
    textColor?: string;
}

const IconTextItem: React.FC<IconTextItemProps> = ({
    icon,
    text,
    iconSize = 28,
    textColor = colors.white,
}) => {
    return (
        <View style={styles.container}>
            <Text style={{ fontSize: iconSize }}>{icon}</Text>

            <Text style={[styles.text, { color: textColor }]}>
                {text}
            </Text>
        </View>
    );
};

export default IconTextItem;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    text: {
        // color: colors
        marginTop: 6,
        fontSize: 14,
        fontWeight: '500',
    },
});