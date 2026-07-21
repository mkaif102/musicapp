import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Alert,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/Colors';

const PrivacyPolicyScreen = ({ navigation }: any) => {
    const [allowDataCollection, setAllowDataCollection] = useState(true);
    const [allowAnalytics, setAllowAnalytics] = useState(true);
    const [allowAds, setAllowAds] = useState(false);

    const sections = [
        {
            id: '1',
            title: 'Information We Collect',
            icon: 'information-circle-outline',
            color: '#6C63FF',
            content: 'We collect information that you provide directly, such as when you create an account, upload content, or contact us for support. This may include your name, email address, and usage data.',
        },
        {
            id: '2',
            title: 'How We Use Your Data',
            icon: 'analytics-outline',
            color: '#1DB954',
            content: 'Your data is used to provide, maintain, and improve our services. We use your information to personalize your experience, send notifications, and analyze usage patterns.',
        },
        {
            id: '3',
            title: 'Data Security',
            icon: 'shield-outline',
            color: '#FF6B6B',
            content: 'We implement industry-standard security measures to protect your data. This includes encryption, secure servers, and regular security audits to prevent unauthorized access.',
        },
        {
            id: '4',
            title: 'Third-Party Services',
            icon: 'share-outline',
            color: '#FFD93D',
            content: 'We may use third-party services to enhance our app functionality. These services have their own privacy policies and we recommend reviewing them.',
        },
        {
            id: '5',
            title: 'Cookies & Tracking',
            icon: 'cafe-outline',
            color: '#4ECDC4',
            content: 'We use cookies and similar technologies to improve your experience, analyze trends, and administer our services. You can control cookie preferences in your device settings.',
        },
        {
            id: '6',
            title: 'Data Retention',
            icon: 'time-outline',
            color: '#FF9F43',
            content: 'We retain your data only as long as necessary to provide our services. You may request deletion of your data at any time by contacting our support team.',
        },
        {
            id: '7',
            title: 'Your Rights',
            icon: 'people-outline',
            color: '#6C63FF',
            content: 'You have the right to access, update, or delete your personal data. You can also request a copy of your data or restrict its processing.',
        },
        {
            id: '8',
            title: 'Children\'s Privacy',
            icon: 'child-outline',
            color: '#1DB954',
            content: 'Our services are not directed to children under 13. We do not knowingly collect personal information from children. If we become aware, we will take steps to remove such data.',
        },
        {
            id: '9',
            title: 'Updates to Policy',
            icon: 'refresh-outline',
            color: '#FF6B6B',
            content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date.',
        },
        {
            id: '10',
            title: 'Contact Us',
            icon: 'mail-outline',
            color: '#FFD93D',
            content: 'If you have any questions or concerns about our privacy practices, please contact us at privacy@musicapp.com or through our support channels.',
        },
    ];

    const handleAccept = () => {
        Alert.alert(
            'Privacy Settings',
            'Your privacy preferences have been saved successfully!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const PrivacyToggle = ({
        label,
        value,
        onValueChange,
        description
    }: {
        label: string;
        value: boolean;
        onValueChange: (val: boolean) => void;
        description: string;
    }) => (
        <View style={styles.toggleItem}>
            <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>{label}</Text>
                <Text style={styles.toggleDescription}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#2C2C2C', true: '#1DB954' }}
                thumbColor={value ? '#FFFFFF' : '#666666'}
                ios_backgroundColor="#2C2C2C"
            />
        </View>
    );

    const SectionItem = ({ section, index }: { section: any; index: number }) => (
        <View style={[styles.sectionCard, index === sections.length - 1 && styles.lastSection]}>
            <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: section.color + '20' }]}>
                    <Icon name={section.icon} size={22} color={section.color} />
                </View>
                <View style={styles.sectionNumberBadge}>
                    <Text style={[styles.sectionNumber, { color: section.color }]}>{index + 1}</Text>
                </View>
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
        </View>
    );

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
                <Text style={styles.title}>Privacy Policy</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.headerCard}>
                    <View style={styles.headerCardIcon}>
                        <Icon name="shield-checkmark-outline" size={40} color={'#1DB954'} />
                    </View>
                    <Text style={styles.headerCardTitle}>Your Privacy Matters</Text>
                    <Text style={styles.headerCardSubtitle}>
                        We are committed to protecting your personal information and being transparent about how we handle your data.
                    </Text>
                    <View style={styles.headerCardBadge}>
                        <Icon name="checkmark-circle" size={14} color="#1DB954" />
                        <Text style={styles.headerCardBadgeText}>GDPR Compliant</Text>
                    </View>
                </View>

                {/* Privacy Controls */}
                <View style={styles.controlsContainer}>
                    <Text style={styles.controlsTitle}>Privacy Controls</Text>
                    <View style={styles.controlsCard}>
                        <PrivacyToggle
                            label="Data Collection"
                            value={allowDataCollection}
                            onValueChange={setAllowDataCollection}
                            description="Allow us to collect usage data to improve your experience"
                        />
                        <View style={styles.toggleDivider} />
                        <PrivacyToggle
                            label="Analytics"
                            value={allowAnalytics}
                            onValueChange={setAllowAnalytics}
                            description="Share anonymous usage data for analytics"
                        />
                        <View style={styles.toggleDivider} />
                        <PrivacyToggle
                            label="Personalized Ads"
                            value={allowAds}
                            onValueChange={setAllowAds}
                            description="Allow personalized advertisements based on your preferences"
                        />
                    </View>
                </View>

                {/* Summary Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>🔒</Text>
                        <Text style={styles.statLabel}>Encrypted</Text>
                        <Text style={styles.statValue}>All Data</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>📊</Text>
                        <Text style={styles.statLabel}>Tracked</Text>
                        <Text style={styles.statValue}>Anonymous Only</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>🛡️</Text>
                        <Text style={styles.statLabel}>Protected</Text>
                        <Text style={styles.statValue}>GDPR Compliant</Text>
                    </View>
                </View>

                {/* Policy Sections */}
                <View style={styles.sectionsContainer}>
                    <View style={styles.sectionsHeader}>
                        <Text style={styles.sectionsTitle}>Privacy Policy</Text>
                        <View style={styles.sectionsCountBadge}>
                            <Text style={styles.sectionsCount}>{sections.length} Sections</Text>
                        </View>
                    </View>

                    {sections.map((section, index) => (
                        <SectionItem key={section.id} section={section} index={index} />
                    ))}
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleAccept}
                        activeOpacity={0.7}
                    >
                        <Icon name="checkmark-outline" size={20} color="#121212" />
                        <Text style={styles.saveButtonText}>Save Preferences</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        We respect your privacy and are committed to protecting your data.
                    </Text>
                    <Text style={styles.footerVersion}>Last Updated: January 2026</Text>
                </View>

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
    headerRight: {
        width: 44,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Header Card
    headerCard: {
        backgroundColor: '#1E1E1E',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    headerCardIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerCardTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 6,
    },
    headerCardSubtitle: {
        fontSize: 14,
        color: '#B3B3B3',
        textAlign: 'center',
        lineHeight: 20,
    },
    headerCardBadge: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    headerCardBadgeText: {
        color: '#1DB954',
        fontSize: 12,
        fontWeight: '600',
    },

    // Privacy Controls
    controlsContainer: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    controlsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 10,
    },
    controlsCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    toggleInfo: {
        flex: 1,
        marginRight: 12,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.white,
    },
    toggleDescription: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    toggleDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 16,
    },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        marginHorizontal: 16,
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 22,
        marginBottom: 4,
    },
    statLabel: {
        color: '#B3B3B3',
        fontSize: 12,
        fontWeight: '500',
    },
    statValue: {
        color: '#1DB954',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    // Sections
    sectionsContainer: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    sectionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
    },
    sectionsCountBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    sectionsCount: {
        color: '#B3B3B3',
        fontSize: 12,
        fontWeight: '600',
    },
    sectionCard: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    lastSection: {
        marginBottom: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionNumberBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    sectionNumber: {
        fontSize: 12,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
        marginBottom: 4,
        marginLeft: 8,
    },
    sectionContent: {
        fontSize: 14,
        color: '#B3B3B3',
        lineHeight: 22,
        marginLeft: 8,
    },

    // Actions
    actionsContainer: {
        marginHorizontal: 16,
        marginTop: 24,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#1DB954',
        gap: 8,
    },
    saveButtonText: {
        color: '#121212',
        fontSize: 16,
        fontWeight: '700',
    },

    // Footer
    footer: {
        marginTop: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    footerText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    footerVersion: {
        color: '#444',
        fontSize: 11,
        marginTop: 8,
    },
});

export default PrivacyPolicyScreen;