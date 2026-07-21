import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/Colors';

interface MenuItem {
    id: string;
    icon: string;
    title: string;
    color: string;
    screen: string;
}

interface MenuListProps {
    data: MenuItem[];
}

const MenuList = ({ data }: MenuListProps) => {
    const navigation: any = useNavigation();

    const handlePress = (item: MenuItem) => {
        if (item.screen) {
            navigation.navigate(item.screen);
        }
    };

    return (
        <>
            {data.map((item, index) => (
                <TouchableOpacity
                    key={item.id}
                    style={[
                        styles.menuItem,
                        index === data.length - 1 && styles.lastMenuItem,
                    ]}
                    onPress={() => handlePress(item)}
                >
                    <View
                        style={[
                            styles.menuIconContainer,
                            { backgroundColor: item.color + '20' },
                        ]}
                    >
                        <Icon
                            name={item.icon}
                            size={22}
                            color={item.color}
                        />
                    </View>

                    <Text style={styles.menuText}>{item.title}</Text>

                    <Icon
                        name="chevron-forward-outline"
                        size={20}
                        color="#666"
                    />
                </TouchableOpacity>
            ))}
        </>
    );
};

export default MenuList;

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },

    lastMenuItem: {
        borderBottomWidth: 0,
    },

    menuIconContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },

    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: colors.white
    },
});