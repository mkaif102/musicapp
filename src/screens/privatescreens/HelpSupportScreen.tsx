import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Platform,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/Colors';

const HelpSupportScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('FAQ');

    // FAQ Data
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

    const handleReportIssue = () => {
        Alert.alert(
            'Report an Issue',
            'Please describe your issue briefly:',
            [
                {
                    text: 'Submit',
                    onPress: () => Alert.alert('Thank You', 'Your report has been submitted. We\'ll get back to you soon!'),
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleFeedback = () => {
        Alert.alert(
            'Feedback',
            'We\'d love to hear your thoughts! Rate your experience:',
            [
                { text: '😍 Love it', onPress: () => Alert.alert('Thank You', 'We\'re glad you love it! ❤️') },
                { text: '😊 Good', onPress: () => Alert.alert('Thanks', 'We\'ll keep improving!') },
                { text: '😐 Okay', onPress: () => Alert.alert('Noted', 'We\'ll work on making it better!') },
                { text: '😔 Needs Work', onPress: () => Alert.alert('Sorry', 'We\'ll do better!') },
            ]
        );
    };

    const getFilteredFAQs = () => {
        let filtered = faqs;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (activeTab !== 'All') {
            filtered = filtered.filter(faq => faq.category === activeTab);
        }

        return filtered;
    };

    const filteredFAQs = getFilteredFAQs();

    const SupportCard = ({ icon, title, description, onPress, color }: any) => (
        <TouchableOpacity style={styles.supportCard} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.supportIconContainer, { backgroundColor: color }]}>
                <Icon name={icon} size={24} color={colors.white} />
            </View>
            <View style={styles.supportCardContent}>
                <Text style={styles.supportCardTitle}>{title}</Text>
                <Text style={styles.supportCardDescription}>{description}</Text>
            </View>
            <Icon name="chevron-forward-outline" size={20} color="#666" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Icon name="arrow-back" size={24} color={'#ffffff'} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Help & Support</Text>
                    </View>
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

                    {/* Quick Support Cards */}
                    <View style={styles.supportCardsContainer}>
                        <SupportCard
                            icon="mail-outline"
                            title="Contact Us"
                            description="Get in touch with our team"
                            color="#1DB954"
                            onPress={handleContactSupport}
                        />
                        <SupportCard
                            icon="alert-circle-outline"
                            title="Report Issue"
                            description="Let us know about problems"
                            color="#FF6B6B"
                            onPress={handleReportIssue}
                        />
                        <SupportCard
                            icon="chatbubble-outline"
                            title="Live Chat"
                            description="Chat with support 24/7"
                            color="#4ECDC4"
                            onPress={() => Alert.alert('Live Chat', 'Connecting to support...')}
                        />
                        <SupportCard
                            icon="star-outline"
                            title="Feedback"
                            description="Share your experience"
                            color="#F7DC6F"
                            onPress={handleFeedback}
                        />
                    </View>

                    {/* FAQs Section */}
                    <View style={styles.faqsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('FAQsList')}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
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
                                        activeTab === category && styles.categoryTabActive,
                                    ]}
                                    onPress={() => setActiveTab(category)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.categoryTabText,
                                            activeTab === category && styles.categoryTabTextActive,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* FAQs List */}
                        {filteredFAQs.length > 0 ? (
                            <View style={styles.faqsList}>
                                {filteredFAQs.map((faq, index) => (
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
                                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                                            <Icon name="chevron-forward-outline" size={20} color="#666" />
                                        </View>
                                        <View style={styles.faqCategoryBadge}>
                                            <Text style={styles.faqCategoryText}>{faq.category}</Text>
                                        </View>
                                    </TouchableOpacity>
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

                    {/* Community Section */}
                    <View style={styles.communitySection}>
                        <Text style={styles.communityTitle}>Join Our Community</Text>
                        <View style={styles.communityButtons}>
                            <TouchableOpacity style={styles.communityButton}>
                                <Icon name="logo-facebook" size={24} color="#1877F2" />
                                <Text style={styles.communityButtonText}>Facebook</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.communityButton}>
                                <Icon name="logo-twitter" size={24} color="#1DA1F2" />
                                <Text style={styles.communityButtonText}>Twitter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.communityButton}>
                                <Icon name="logo-discord" size={24} color="#5865F2" />
                                <Text style={styles.communityButtonText}>Discord</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 20,
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
    supportCardsContainer: {
        marginBottom: 24,
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    supportIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    supportCardContent: {
        flex: 1,
    },
    supportCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
        marginBottom: 2,
    },
    supportCardDescription: {
        fontSize: 13,
        color: '#B3B3B3',
    },
    faqsSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
    },
    viewAllText: {
        color: '#1DB954',
        fontSize: 14,
        fontWeight: '600',
    },
    categoryTabs: {
        marginBottom: 16,
    },
    categoryTabsContent: {
        paddingVertical: 4,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        marginRight: 8,
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
    faqsList: {
        backgroundColor: '#1E1E1E',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
    },
    faqItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    faqItemLast: {
        borderBottomWidth: 0,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: colors.white,
        marginRight: 12,
    },
    faqCategoryBadge: {
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    faqCategoryText: {
        color: '#1DB954',
        fontSize: 11,
        fontWeight: '600',
    },
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
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
    communitySection: {
        marginBottom: 24,
    },
    communityTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 16,
    },
    communityButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    communityButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E1E1E',
        paddingVertical: 12,
        borderRadius: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 8,
    },
    communityButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    versionText: {
        color: '#666',
        fontSize: 13,
        marginBottom: 4,
    },
    versionSubtext: {
        color: '#444',
        fontSize: 11,
    },
});

export default HelpSupportScreen;