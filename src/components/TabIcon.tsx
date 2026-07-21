import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TabIconProps {
    name: string;
    size: number;
    color: string;
}

const TabIcon = ({ name, size, color }: TabIconProps) => {
    return (
        <Ionicons
            name={name}
            size={size}
            color={color}
        />
    );
};

export default TabIcon;