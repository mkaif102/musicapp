import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/Colors';

const HelpCenterScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    const faqs = [
        {
            id: '1',
            question: 'How do I create an account?',
            answer: 'Tap on the "Sign Up" button on the login screen. Enter your name, email address, and create a secure password. Then verify your email and you\'re ready to go!',
            icon: 'person-add-outline',
            category: 'Account',
        },
        {
            id: '2',
            question: 'How do I reset my password?',
            answer: 'Go to the Login screen and tap on "Forgot Password". Enter your registered email address and we\'ll send you a password reset link. Follow the instructions to create a new password.',
            icon: 'key-outline',
            category: 'Account',
        },
        {
            id: '3',
            question: 'How do I contact support?',
            answer: 'You can reach us through multiple channels: Email us at support@musicapp.com, use the in-app chat feature, or call our support hotline at +1-800-123-4567. We\'re available 24/7.',
            icon: 'mail-outline',
            category: 'Support',
        },
        {
            id: '4',
            question: 'How do I create a playlist?',
            answer: 'Go to the "My Playlists" section and tap the "+" button. Give your playlist a name, add a cover image, and start adding songs from your library or search for new music.',
            icon: 'musical-notes-outline',
            category: 'Music',
        },
        {
            id: '5',
            question: 'Can I download songs for offline listening?',
            answer: 'Yes! Premium users can download songs and playlists for offline listening. Look for the download icon (↓) next to any song or playlist. Downloaded content is available in your "Downloads" section.',
            icon: 'download-outline',
            category: 'Music',
        },
        {
            id: '6',
            question: 'Why can\'t I play a song?',
            answer: 'If a song won\'t play, check your internet connection first. If you\'re online, try restarting the app or clearing your cache. For persistent issues, contact our support team.',
            icon: 'alert-circle-outline',
            category: 'Troubleshooting',
        },
        {
            id: '7',
            question: 'How do I change my profile picture?',
            answer: 'Go to your Profile, tap on your avatar, and select "Change Photo". You can choose from your gallery, take a new photo, or remove your current picture.',
            icon: 'camera-outline',
            category: 'Profile',
        },
        {
            id: '8',
            question: 'What is the premium subscription?',
            answer: 'Premium subscription gives you ad-free listening, unlimited skips, high-quality audio (320kbps), offline downloads, and exclusive content. You can try it free for 7 days.',
            icon: 'diamond-outline',
            category: 'Premium',
        },
        {
            id: '9',
            question: 'How do I cancel my subscription?',
            answer: 'Go to Settings > Premium > Manage Subscription. From there, you can cancel your subscription. You\'ll continue to have access until the end of your current billing period.',
            icon: 'close-circle-outline',
            category: 'Premium',
        },
        {
            id: '10',
            question: 'How do I share a song with friends?',
            answer: 'Tap the three dots (⋯) next to any song and select "Share". You can share via various platforms including WhatsApp, Messenger, Instagram, and more.',
            icon: 'share-social-outline',
            category: 'Social',
        },
    ];

    const categories = ['All', 'Account', 'Music', 'Support', 'Troubleshooting', 'Profile', 'Premium', 'Social'];
    const [selectedCategory, setSelectedCategory] = useState('All');

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

    const toggleFaq = (id: string) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to reach us?',
            [
                { text: 'Email', onPress: () => Linking.openURL('mailto:support@musicapp.com') },
                { text: 'Chat', onPress: () => Alert.alert('Chat', 'Chat support is available 24/7. Connecting you to an agent...') },
                { text: 'Call', onPress: () => Alert.alert('Call', 'Calling support hotline...') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const QuickActionCard = ({ icon, title, description, onPress, color }: any) => (
        <TouchableOpacity
            style={styles.quickActionCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={28} color={color} />
            </View>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionDescription}>{description}</Text>
        </TouchableOpacity>
    );

    const FAQItem = ({ faq }: { faq: any }) => {
        const isExpanded = expandedFaq === faq.id;
        return (
            <TouchableOpacity
                style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.7}
            >
                <View style={styles.faqHeader}>
                    <View style={styles.faqHeaderLeft}>
                        <View style={[styles.faqIconContainer, { backgroundColor: '#1DB95420' }]}>
                            <Icon name={faq.icon} size={20} color="#1DB954" />
                        </View>
                        <View style={styles.faqHeaderText}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <View style={styles.faqCategoryBadge}>
                                <Text style={styles.faqCategoryText}>{faq.category}</Text>
                            </View>
                        </View>
                    </View>
                    <Icon
                        name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                        size={22}
                        color="#666"
                    />
                </View>
                {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                        <View style={styles.faqDivider} />
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        <TouchableOpacity
                            style={styles.faqActionButton}
                            onPress={() => Alert.alert('Need More Help?', 'Contact our support team for assistance.')}
                        >
                            <Text style={styles.faqActionText}>Need more help?</Text>
                            <Icon name="arrow-forward-outline" size={16} color="#1DB954" />
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.title}>Help Center</Text>
                <TouchableOpacity
                    style={styles.headerActionButton}
                    onPress={handleContactSupport}
                >
                    <Icon name="headset-outline" size={24} color="#1DB954" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for help..."
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

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <QuickActionCard
                        icon="mail-outline"
                        title="Email Us"
                        description="Get support via email"
                        color="#1DB954"
                        onPress={() => Linking.openURL('mailto:support@musicapp.com')}
                    />
                    <QuickActionCard
                        icon="chatbubble-outline"
                        title="Live Chat"
                        description="Chat with our team"
                        color="#6C63FF"
                        onPress={() => Alert.alert('Live Chat', 'Connecting you to a support agent...')}
                    />
                    <QuickActionCard
                        icon="call-outline"
                        title="Call Us"
                        description="Speak to an agent"
                        color="#FF6B6B"
                        onPress={() => Alert.alert('Call Support', 'Calling support hotline...')}
                    />
                </View>

                {/* FAQs Section */}
                <View style={styles.faqSection}>
                    <View style={styles.faqSectionHeader}>
                        <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>
                        <Text style={styles.faqCount}>{filteredFAQs.length} FAQs</Text>
                    </View>

                    {/* Category Tabs */}
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

                    {/* FAQs List */}
                    {filteredFAQs.length > 0 ? (
                        <View style={styles.faqList}>
                            {filteredFAQs.map((faq) => (
                                <FAQItem key={faq.id} faq={faq} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.noResultsContainer}>
                            <Text style={styles.noResultsEmoji}>🔍</Text>
                            <Text style={styles.noResultsTitle}>No results found</Text>
                            <Text style={styles.noResultsSubtitle}>
                                Try adjusting your search or category filter
                            </Text>
                        </View>
                    )}
                </View>

                {/* Still Need Help */}
                <View style={styles.helpFooter}>
                    <View style={styles.helpFooterIcon}>
                        <Icon name="help-circle-outline" size={32} color="#1DB954" />
                    </View>
                    <Text style={styles.helpFooterTitle}>Still need help?</Text>
                    <Text style={styles.helpFooterSubtitle}>
                        Our support team is available 24/7 to assist you
                    </Text>
                    <TouchableOpacity
                        style={styles.helpFooterButton}
                        onPress={handleContactSupport}
                    >
                        <Text style={styles.helpFooterButtonText}>Contact Support</Text>
                        <Icon name="arrow-forward-outline" size={18} color="#121212" />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#121212',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
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
    title: {
        flex: 1,
        textAlign: 'center',
        color: colors.white,
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    headerActionButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginHorizontal: 16,
        marginTop: 16,
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

    // Quick Actions
    quickActionsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        gap: 10,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionTitle: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    quickActionDescription: {
        color: '#666',
        fontSize: 11,
        textAlign: 'center',
    },

    // FAQs
    faqSection: {
        marginHorizontal: 16,
        marginTop: 20,
    },
    faqSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    faqSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
    },
    faqCount: {
        color: '#B3B3B3',
        fontSize: 13,
        fontWeight: '500',
    },

    // Categories
    categoryTabs: {
        marginBottom: 12,
    },
    categoryTabsContent: {
        paddingVertical: 4,
        gap: 8,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    categoryTabActive: {
        backgroundColor: '#1DB954',
        borderColor: '#1DB954',
    },
    categoryTabText: {
        color: '#B3B3B3',
        fontSize: 13,
        fontWeight: '600',
    },
    categoryTabTextActive: {
        color: '#121212',
    },

    // FAQ List
    faqList: {
        gap: 8,
    },
    faqItem: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    faqItemExpanded: {
        borderColor: '#1DB954',
        borderWidth: 1.5,
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
    faqIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    faqHeaderText: {
        flex: 1,
    },
    faqQuestion: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    faqCategoryBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    faqCategoryText: {
        color: '#B3B3B3',
        fontSize: 10,
        fontWeight: '500',
    },
    faqAnswerContainer: {
        marginTop: 10,
    },
    faqDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 10,
    },
    faqAnswer: {
        color: '#B3B3B3',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 8,
    },
    faqActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
    },
    faqActionText: {
        color: '#1DB954',
        fontSize: 13,
        fontWeight: '600',
    },

    // No Results
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
    },
    noResultsEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    noResultsTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    noResultsSubtitle: {
        color: '#B3B3B3',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },

    // Help Footer
    helpFooter: {
        backgroundColor: '#1E1E1E',
        marginHorizontal: 16,
        marginTop: 20,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    helpFooterIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    helpFooterTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 4,
    },
    helpFooterSubtitle: {
        fontSize: 14,
        color: '#B3B3B3',
        textAlign: 'center',
        marginBottom: 16,
    },
    helpFooterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1DB954',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    helpFooterButtonText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default HelpCenterScreen;