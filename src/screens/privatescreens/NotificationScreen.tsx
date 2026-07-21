import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    FlatList,
    Image,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const NotificationScreen = ({ navigation }: any) => {
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'like',
            title: 'Liked your song',
            description: 'Talha Anjum liked your song "Afsanay"',
            time: '2 min ago',
            image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&auto=format&fit=crop',
            read: false,
        },
        {
            id: '2',
            type: 'comment',
            title: 'Commented on your post',
            description: 'Hasan Raheem: "Amazing track! Keep it up 🎵"',
            time: '15 min ago',
            image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop',
            read: false,
        },
        {
            id: '3',
            type: 'follow',
            title: 'Started following you',
            description: 'Talwinder started following you',
            time: '1 hour ago',
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=100&auto=format&fit=crop',
            read: false,
        },
        {
            id: '4',
            type: 'playlist',
            title: 'Added to playlist',
            description: 'Your song "Mann" was added to "Chill Vibes" playlist',
            time: '3 hours ago',
            image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=100&auto=format&fit=crop',
            read: true,
        },
        {
            id: '5',
            type: 'achievement',
            title: 'Achievement Unlocked!',
            description: 'You reached 1,000 streams on your song "Kya Tumhe Pata Hai"',
            time: '5 hours ago',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100&auto=format&fit=crop',
            read: true,
        },
        {
            id: '6',
            type: 'featured',
            title: 'Your song is featured!',
            description: 'Your track "Afsanay" is now featured on "Trending Pakistan"',
            time: '1 day ago',
            image: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=100&auto=format&fit=crop',
            read: true,
        },
        {
            id: '7',
            type: 'new_release',
            title: 'New release from your favorite artist',
            description: 'Talha Anjum just released a new track "Gumaan"',
            time: '2 days ago',
            image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=100&auto=format&fit=crop',
            read: true,
        },
    ]);

    const [selectedFilter, setSelectedFilter] = useState('All');
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    const filters = ['All', 'Unread', 'Likes', 'Comments', 'Follows'];

    const getFilteredNotifications = () => {
        if (selectedFilter === 'All') return notifications;
        if (selectedFilter === 'Unread') return notifications.filter(n => !n.read);
        if (selectedFilter === 'Likes') return notifications.filter(n => n.type === 'like');
        if (selectedFilter === 'Comments') return notifications.filter(n => n.type === 'comment');
        if (selectedFilter === 'Follows') return notifications.filter(n => n.type === 'follow');
        return notifications;
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return { name: 'heart', color: '#FF6B6B' };
            case 'comment':
                return { name: 'chatbubble', color: '#4ECDC4' };
            case 'follow':
                return { name: 'person-add', color: '#6C63FF' };
            case 'playlist':
                return { name: 'musical-notes', color: '#FFA07A' };
            case 'achievement':
                return { name: 'trophy', color: '#FFD93D' };
            case 'featured':
                return { name: 'star', color: '#FF6B9D' };
            case 'new_release':
                return { name: 'newspaper', color: '#1DB954' };
            default:
                return { name: 'notifications', color: '#B3B3B3' };
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const renderNotificationItem = ({ item }: { item: any }) => {
        const icon = getNotificationIcon(item.type);
        const isUnread = !item.read;

        return (
            <TouchableOpacity
                style={[styles.notificationItem, isUnread && styles.unreadItem]}
                activeOpacity={0.7}
                onPress={() => markAsRead(item.id)}
                onLongPress={() => deleteNotification(item.id)}
            >
                <View style={styles.notificationLeft}>
                    <View style={[styles.notificationIcon, { backgroundColor: icon.color + '20' }]}>
                        <Icon name={icon.name} size={16} color={icon.color} />
                    </View>
                    <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                            <Text style={styles.notificationTitle}>{item.title}</Text>
                            {isUnread && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                        <Text style={styles.notificationTime}>{item.time}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(item.id)}
                >
                    <Icon name="close-outline" size={20} color="#B3B3B3" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={markAllAsRead}  // FIXED: Changed from markAllRead to markAllAsRead
                    >
                        <Text style={styles.markAllText}>Mark all</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{notifications.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: '#1DB954' }]}>
                            {unreadCount}
                        </Text>
                        <Text style={styles.statLabel}>Unread</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {notifications.filter(n => n.read).length}
                        </Text>
                        <Text style={styles.statLabel}>Read</Text>
                    </View>
                </View>

                {/* Filter Pills */}
                <View style={styles.filterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterList}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterPill,
                                    selectedFilter === filter && styles.filterPillActive,
                                ]}
                                onPress={() => setSelectedFilter(filter)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        selectedFilter === filter && styles.filterTextActive,
                                    ]}
                                >
                                    {filter}
                                    {filter === 'Unread' && unreadCount > 0 && (
                                        <Text style={styles.filterCount}> ({unreadCount})</Text>
                                    )}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Notifications List */}
                {getFilteredNotifications().length > 0 ? (
                    <FlatList
                        data={getFilteredNotifications()}
                        renderItem={renderNotificationItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.notificationList}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                            <View style={styles.separator} />
                        )}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Icon name="notifications-off-outline" size={60} color="#3D3D3D" />
                        </View>
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptyDescription}>
                            You're all caught up! No new notifications at the moment.
                        </Text>
                    </View>
                )}
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    content: {
        flex: 1,
    },
    header: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    markAllButton: {
        padding: 8,
    },
    markAllText: {
        color: '#1DB954',
        fontSize: 14,
        fontWeight: '600',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#151515',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: '#888888',
        fontSize: 11,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    filterContainer: {
        marginVertical: 12,
    },
    filterList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#151515',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    filterPillActive: {
        backgroundColor: '#1DB954',
        borderColor: '#1DB954',
    },
    filterText: {
        color: '#A7A7A7',
        fontSize: 13,
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#000000',
        fontWeight: '600',
    },
    filterCount: {
        color: '#FF6B6B',
    },
    notificationList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    unreadItem: {
        backgroundColor: 'rgba(29, 185, 84, 0.05)',
    },
    notificationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    notificationIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    notificationTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#1DB954',
        marginLeft: 8,
    },
    notificationDescription: {
        color: '#B3B3B3',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
    },
    notificationTime: {
        color: '#888888',
        fontSize: 11,
    },
    deleteButton: {
        padding: 8,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginHorizontal: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 80,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#151515',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyDescription: {
        color: '#888888',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default NotificationScreen;