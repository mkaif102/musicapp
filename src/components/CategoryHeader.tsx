// src/components/home/CategoryHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CategoryHeaderProps {
    title: string;
    onSeeAll?: () => void;
    showSeeAll?: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
    title,
    onSeeAll,
    showSeeAll = true
}) => {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {showSeeAll && onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
    seeAll: {
        color: '#1DB954',
        fontSize: 13,
        fontWeight: '700',
    },
});

export default CategoryHeader;