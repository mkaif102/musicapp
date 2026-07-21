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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/Colors';

const TermsOfServiceScreen = ({ navigation }: any) => {
    const [isAccepted, setIsAccepted] = useState(false);

    const sections = [
        {
            id: '1',
            title: 'Acceptance of Terms',
            icon: 'checkmark-circle-outline',
            content: 'By using this application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.',
        },
        {
            id: '2',
            title: 'User Accounts',
            icon: 'person-outline',
            content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.',
        },
        {
            id: '3',
            title: 'Content Ownership',
            icon: 'document-outline',
            content: 'All content, including music, artwork, and text, is the property of their respective owners. You agree not to reproduce, distribute, or create derivative works without permission.',
        },
        {
            id: '4',
            title: 'User Conduct',
            icon: 'shield-outline',
            content: 'You agree to use the application in compliance with all applicable laws. You will not engage in any activity that disrupts or interferes with the service.',
        },
        {
            id: '5',
            title: 'Termination',
            icon: 'alert-circle-outline',
            content: 'We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion.',
        },
        {
            id: '6',
            title: 'Changes to Terms',
            icon: 'refresh-outline',
            content: 'We may update these terms from time to time. We will notify you of any changes by posting the new terms on this page. Continued use constitutes acceptance.',
        },
        {
            id: '7',
            title: 'Disclaimer of Warranties',
            icon: 'warning-outline',
            content: 'The application is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.',
        },
        {
            id: '8',
            title: 'Limitation of Liability',
            icon: 'scale-outline',
            content: 'We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the application.',
        },
        {
            id: '9',
            title: 'Governing Law',
            icon: 'globe-outline',
            content: 'These terms are governed by and construed in accordance with the laws of your jurisdiction.',
        },
        {
            id: '10',
            title: 'Contact Us',
            icon: 'mail-outline',
            content: 'If you have any questions about these terms, please contact us at support@musicapp.com',
        },
    ];

    const handleAccept = () => {
        Alert.alert(
            'Accept Terms',
            'By accepting, you agree to our Terms of Service and Privacy Policy.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept',
                    onPress: () => {
                        setIsAccepted(true);
                        Alert.alert('Success', 'Terms accepted successfully!');
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const handleDecline = () => {
        Alert.alert(
            'Decline Terms',
            'You must accept the terms to continue using the app.',
            [
                { text: 'Go Back', style: 'cancel' },
                { text: 'Accept Terms', onPress: handleAccept }
            ]
        );
    };

    const SectionItem = ({ section, index }: { section: any; index: number }) => (
        <View style={[styles.sectionCard, index === sections.length - 1 && styles.lastSection]}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                    <Icon name={section.icon} size={24} color={'#1DB954'} />
                </View>
                <View style={styles.sectionNumberBadge}>
                    <Text style={styles.sectionNumber}>{index + 1}</Text>
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
                <Text style={styles.title}>Terms of Service</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.headerCardIcon}>
                        <Icon name="document-text-outline" size={40} color={'#1DB954'} />
                    </View>
                    <Text style={styles.headerCardTitle}>Terms & Conditions</Text>
                    <Text style={styles.headerCardSubtitle}>
                        Please read these terms carefully before using the Music App
                    </Text>
                    <View style={styles.headerCardBadge}>
                        <Text style={styles.headerCardBadgeText}>Last Updated: January 2026</Text>
                    </View>
                </View>

                {/* Summary Section */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Icon name="time-outline" size={20} color={'#1DB954'} />
                        <Text style={styles.summaryText}>Effective immediately</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Icon name="people-outline" size={20} color={'#1DB954'} />
                        <Text style={styles.summaryText}>Applicable to all users</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Icon name="shield-checkmark-outline" size={20} color={'#1DB954'} />
                        <Text style={styles.summaryText}>Your privacy matters</Text>
                    </View>
                </View>

                {/* Sections */}
                <View style={styles.sectionsContainer}>
                    <View style={styles.sectionsHeader}>
                        <Text style={styles.sectionsTitle}>Terms & Conditions</Text>
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
                        style={styles.declineButton}
                        onPress={handleDecline}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={handleAccept}
                        activeOpacity={0.7}
                    >
                        <Icon name="checkmark-outline" size={20} color="#121212" />
                        <Text style={styles.acceptButtonText}>Accept Terms</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By accepting, you agree to our Terms of Service and Privacy Policy
                    </Text>
                    <Text style={styles.footerVersion}>Version 2.0.1</Text>
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
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    headerCardBadgeText: {
        color: '#1DB954',
        fontSize: 12,
        fontWeight: '600',
    },

    // Summary
    summaryContainer: {
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
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryText: {
        color: '#B3B3B3',
        fontSize: 12,
        fontWeight: '500',
    },
    summaryDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    // Sections
    sectionsContainer: {
        marginHorizontal: 16,
        marginTop: 20,
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
        backgroundColor: 'rgba(29, 185, 84, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionNumberBadge: {
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
    },
    sectionNumber: {
        color: '#1DB954',
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
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 24,
        gap: 12,
    },
    declineButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    declineButtonText: {
        color: '#B3B3B3',
        fontSize: 16,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#1DB954',
        gap: 8,
    },
    acceptButtonText: {
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

export default TermsOfServiceScreen;