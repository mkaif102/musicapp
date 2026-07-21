// src/screens/FAQsListScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/Colors';

const FAQsListScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Complete FAQ Data (same as main screen)
    const faqs = [
        {
            id: '1',
            question: 'How do I create a playlist?',
            answer: 'To create a playlist, go to "My Playlists" and tap the "+" button in the top right corner. Enter a name for your playlist and start adding songs.',
            category: 'Getting Started',
        },
        {
            id: '2',
            question: 'How can I download songs for offline listening?',
            answer: 'To download songs, tap the download icon (↓) next to any song or playlist. Your downloads will be available in the "Downloads" section when you\'re offline.',
            category: 'Offline Mode',
        },
        {
            id: '3',
            question: 'Why can\'t I play a song?',
            answer: 'If a song won\'t play, check your internet connection. If you\'re online and still can\'t play, try restarting the app or clearing your cache.',
            category: 'Troubleshooting',
        },
        {
            id: '4',
            question: 'How do I change my profile picture?',
            answer: 'Go to your Profile, tap on your avatar, and select "Change Photo". You can choose from your gallery or take a new photo.',
            category: 'Profile',
        },
        {
            id: '5',
            question: 'What is the premium subscription?',
            answer: 'Premium subscription gives you ad-free listening, unlimited skips, high-quality audio, offline downloads, and exclusive content.',
            category: 'Premium',
        },
        {
            id: '6',
            question: 'How do I cancel my subscription?',
            answer: 'To cancel your subscription, go to Settings > Premium > Manage Subscription, and follow the cancellation instructions.',
            category: 'Premium',
        },
        {
            id: '7',
            question: 'How do I share a song with a friend?',
            answer: 'Tap the three dots (⋯) next to any song and select "Share". You can share via various apps including WhatsApp, Messenger, and more.',
            category: 'Social Features',
        },
        {
            id: '8',
            question: 'What happens if I clear my cache?',
            answer: 'Clearing cache removes temporary files and can help improve app performance. It won\'t affect your downloads or playlists.',
            category: 'Troubleshooting',
        },
    ];

    const categories = ['All', 'Getting Started', 'Offline Mode', 'Troubleshooting', 'Profile', 'Premium', 'Social Features'];

    const handleFAQPress = (faq: any) => {
        Alert.alert(
            faq.question,
            faq.answer,
            [
                { text: 'Got it', style: 'default' },
                { text: 'Contact Support', onPress: () => handleContactSupport() },
            ]
        );
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to reach us?',
            [
                { text: 'Email', onPress: () => Linking.openURL('mailto:support@musicapp.com') },
                { text: 'Chat', onPress: () => Alert.alert('Chat', 'Chat support is available 24/7') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const getFilteredFAQs = () => {
        let filtered = faqs;

        if (searchQuery.trim()) {
            filtered = filtered.filter(faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(faq => faq.category === selectedCategory);
        }

        return filtered;
    };

    const filteredFAQs = getFilteredFAQs();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-back" size={24} color={'#ffffff'} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All FAQs</Text>
                    <View style={styles.headerRight} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search FAQs..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Filter - Updated height */}
                <View style={styles.categoryTabsWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryTabs}
                        contentContainerStyle={styles.categoryTabsContent}
                    >
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryTab,
                                    selectedCategory === category && styles.categoryTabActive,
                                ]}
                                onPress={() => setSelectedCategory(category)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.categoryTabText,
                                        selectedCategory === category && styles.categoryTabTextActive,
                                    ]}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* FAQs Count */}
                <Text style={styles.faqsCount}>
                    {filteredFAQs.length} {filteredFAQs.length === 1 ? 'FAQ' : 'FAQs'} found
                </Text>

                {/* FAQs List */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.faqsListContainer}
                >
                    {filteredFAQs.length > 0 ? (
                        filteredFAQs.map((faq, index) => (
                            <TouchableOpacity
                                key={faq.id}
                                style={[
                                    styles.faqItem,
                                    index === filteredFAQs.length - 1 && styles.faqItemLast,
                                ]}
                                onPress={() => handleFAQPress(faq)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqHeader}>
                                    <View style={styles.faqHeaderLeft}>
                                        <View style={styles.faqNumber}>
                                            <Text style={styles.faqNumberText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    </View>
                                    <Icon name="chevron-forward-outline" size={20} color="#666" />
                                </View>
                                <View style={styles.faqCategoryBadge}>
                                    <Text style={styles.faqCategoryText}>{faq.category}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.noResultsContainer}>
                            <Text style={styles.noResultsEmoji}>🔍</Text>
                            <Text style={styles.noResultsTitle}>No FAQs found</Text>
                            <Text style={styles.noResultsSubtitle}>
                                Try adjusting your search or category filter
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#121212',
    },
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1E1E1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.5,
    },
    headerRight: {
        width: 44,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 48,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: colors.white,
        fontSize: 16,
        padding: 0,
    },
    // Category Tabs - Fixed height wrapper
    categoryTabsWrapper: {
        height: 44, // Fixed height for the tabs container
        marginBottom: 12,
    },
    categoryTabs: {
        flexGrow: 0, // Prevents ScrollView from expanding
    },
    categoryTabsContent: {
        height: 44, // Fixed height for content
        alignItems: 'center', // Centers items vertically
        paddingHorizontal: 2,
    },
    categoryTab: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 22,
        backgroundColor: '#1E1E1E',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 40, // Fixed height for each tab
        justifyContent: 'center', // Centers text vertically
        alignItems: 'center', // Centers text horizontally
    },
    categoryTabActive: {
        backgroundColor: '#1DB954',
        borderColor: '#1DB954',
    },
    categoryTabText: {
        color: '#B3B3B3',
        fontSize: 13,
        fontWeight: '600',
        includeFontPadding: false, // Removes extra padding
        textAlignVertical: 'center', // Centers text vertically on Android
    },
    categoryTabTextActive: {
        color: '#121212',
    },
    faqsCount: {
        color: '#B3B3B3',
        fontSize: 13,
        marginBottom: 12,
    },
    faqsListContainer: {
        paddingBottom: 40,
    },
    faqItem: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    faqItemLast: {
        marginBottom: 0,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqHeaderLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    faqNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    faqNumberText: {
        color: '#1DB954',
        fontSize: 12,
        fontWeight: '700',
    },
    faqQuestion: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: colors.white,
    },
    faqCategoryBadge: {
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
        marginLeft: 40,
    },
    faqCategoryText: {
        color: '#1DB954',
        fontSize: 11,
        fontWeight: '600',
    },
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    noResultsEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    noResultsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 6,
    },
    noResultsSubtitle: {
        fontSize: 14,
        color: '#B3B3B3',
        textAlign: 'center',
    },
});

export default FAQsListScreen;