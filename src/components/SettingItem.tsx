// src/components/SettingItem.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ViewStyle,
    TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/Colors';

interface SettingItemProps {
    icon?: string;
    iconName?: string;
    label: string;
    value?: boolean;
    onToggle?: () => void;
    type?: 'switch' | 'clickable' | 'info';
    onPress?: () => void;
    description?: string;
    iconColor?: string;
    iconSize?: number;
    showArrow?: boolean;
    rightText?: string;
    containerStyle?: ViewStyle;
    labelStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    iconName,
    label,
    value = false,
    onToggle,
    type = 'switch',
    onPress,
    description,
    iconColor = '#1DB954',
    iconSize = 22,
    showArrow = true,
    rightText,
    containerStyle,
    labelStyle,
    descriptionStyle,
    disabled = false,
}) => {
    const isSwitch = type === 'switch';
    const isClickable = type === 'clickable';
    const isInfo = type === 'info';

    const handlePress = () => {
        if (isSwitch) return;
        if (isClickable && onPress) {
            onPress();
        }
        if (isInfo && onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            style={[styles.settingItem, containerStyle]}
            onPress={handlePress}
            activeOpacity={isSwitch ? 1 : 0.7}
            disabled={disabled || isSwitch}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: iconColor + '20' }]}>
                    {icon ? (
                        <Text style={styles.settingIcon}>{icon}</Text>
                    ) : iconName ? (
                        <Icon name={iconName} size={iconSize} color={iconColor} />
                    ) : null}
                </View>
                <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, labelStyle]}>{label}</Text>
                    {description && (
                        <Text style={[styles.settingDescription, descriptionStyle]}>
                            {description}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.settingRight}>
                {rightText && (
                    <Text style={styles.rightText}>{rightText}</Text>
                )}

                {isSwitch && (
                    <Switch
                        value={value}
                        onValueChange={onToggle}
                        trackColor={{ false: '#2C2C2C', true: '#1DB954' }}
                        thumbColor={value ? '#FFFFFF' : '#666666'}
                        ios_backgroundColor="#2C2C2C"
                        disabled={disabled}
                    />
                )}

                {(isClickable || isInfo) && showArrow && (
                    <Icon name="chevron-forward-outline" size={20} color="#666" />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E1E',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    settingIcon: {
        fontSize: 18,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    settingDescription: {
        fontSize: 13,
        color: '#666',
        marginTop: 1,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rightText: {
        color: '#B3B3B3',
        fontSize: 14,
        marginRight: 4,
    },
});

export default SettingItem;