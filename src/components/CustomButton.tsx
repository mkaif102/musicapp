import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    DimensionValue,
} from 'react-native';

interface CustomButtonProps {
    title: string;
    textColor?: string;
    onPress: () => void;
    backgroundColor?: string;
    width?: DimensionValue;
}

const CustomButton = ({
    title,
    onPress,
    backgroundColor = '#6C63FF',
    width = '100%',
    textColor = '#fff',
}: CustomButtonProps) => {

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor,
                    width,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: textColor,
                    },
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default CustomButton;


const styles = StyleSheet.create({

    button: {
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },

    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

});

