import React from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import { colors } from '../theme/Colors';

const CustomHeader = ({ title }: { title: string }) => {
    return (
        <View style={styles.container}>
            {/* <Text style={styles.title}>
                {title}
            </Text> */}
        </View>
    );
};

export default CustomHeader;

const styles = StyleSheet.create({
    container: {
        height: 0,
        backgroundColor: colors.white,
        justifyContent: 'center',
        paddingHorizontal: 20,

        // shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow for Android
        elevation: 3,
    },

    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#222222',
    },
});