import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image,
    Alert,
    Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { colors } from '../../theme/Colors';

interface Message {
    id: string;
    text?: string;
    image?: string;
    sender: 'me' | 'other';
    time: string;
}

const autoReplies = [
    'That\'s awesome! 🎶',
    'Haha, nice one! 😄',
    'I totally agree with you!',
    'Tell me more about it!',
    'Oh really? That\'s cool!',
    'Wow, I didn\'t know that!',
    'Sounds great! 🔥',
    'Let\'s talk more about this later.',
    'Interesting... 🤔',
    'That\'s so cool!',
    'I was just thinking the same thing!',
    'No way! 😮',
    'You\'re absolutely right!',
    'Love that! ❤️',
    'Haha, you\'re funny! 😂',
];

const ChatScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const userName = route?.params?.userName || 'User';
    const [messages, setMessages] = useState<Message[]>([
        // {
        //     id: '1',
        //     text: 'Hey! How are you?',
        //     sender: 'other',
        //     time: '10:30 AM',
        // },
        // {
        //     id: '2',
        //     text: 'I\'m good! What about you?',
        //     sender: 'me',
        //     time: '10:31 AM',
        // },
        // {
        //     id: '3',
        //     text: 'Did you check out the new playlist?',
        //     sender: 'other',
        //     time: '10:32 AM',
        // },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
        );
        return () => showSub.remove();
    }, []);

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const getRandomReply = () => {
        const index = Math.floor(Math.random() * autoReplies.length);
        return autoReplies[index];
    };

    const sendAutoReply = () => {
        setIsTyping(true);
        const delay = 1000 + Math.random() * 2000;

        setTimeout(() => {
            setIsTyping(false);
            const reply: Message = {
                id: Date.now().toString(),
                text: getRandomReply(),
                sender: 'other',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, reply]);
        }, delay);
    };

    const sendMessage = () => {
        if (inputText.trim() === '') return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');
        sendAutoReply();
    };

    const sendImage = (uri: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            image: uri,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newMessage]);
        sendAutoReply();
    };

    const handleAttachPress = () => {
        Keyboard.dismiss();
        setTimeout(() => {
            Alert.alert('Send Image', 'Choose an option', [
                {
                    text: 'Gallery',
                    onPress: () => openGallery(),
                },
                {
                    text: 'Camera',
                    onPress: () => openCamera(),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]);
        }, 300);
    };

    const openGallery = () => {
        const options = {
            mediaType: 'photo' as const,
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.8 as const,
            selectionLimit: 1,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', response.errorMessage || 'Failed to pick image');
                return;
            }
            if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
                sendImage(response.assets[0].uri);
            }
        });
    };

    const openCamera = () => {
        const options = {
            mediaType: 'photo' as const,
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.8 as const,
            saveToPhotos: false,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', response.errorMessage || 'Failed to take photo');
                return;
            }
            if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
                sendImage(response.assets[0].uri);
            }
        });
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View
            style={[
                styles.messageBubble,
                item.sender === 'me' ? styles.myMessage : styles.otherMessage,
                item.image && styles.imageBubble,
            ]}
        >
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.messageImage} />
            ) : (
                <Text style={[styles.messageText, item.sender === 'me' && styles.myMessageText]}>
                    {item.text}
                </Text>
            )}
            <Text style={[styles.messageTime, item.sender === 'me' && styles.myMessageTime]}>
                {item.time}
            </Text>
        </View>
    );

    const renderTypingIndicator = () => {
        if (!isTyping) return null;
        return (
            <View style={[styles.messageBubble, styles.otherMessage, styles.typingBubble]}>
                <View style={styles.typingDots}>
                    <View style={[styles.dot, styles.dot1]} />
                    <View style={[styles.dot, styles.dot2]} />
                    <View style={[styles.dot, styles.dot3]} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{userName}</Text>
                    <Text style={styles.headerStatus}>{isTyping ? 'Typing...' : 'Online'}</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Icon name="ellipsis-vertical" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListFooterComponent={renderTypingIndicator}
                    style={styles.flex1}
                />

                <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 6 }]}>
                    <TouchableOpacity style={styles.attachButton} onPress={handleAttachPress}>
                        <Icon name="add-circle-outline" size={26} color="#1DB954" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#666"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
                        onPress={sendMessage}
                        disabled={!inputText.trim()}
                    >
                        <Icon
                            name="send"
                            size={20}
                            color={inputText.trim() ? '#ffffff' : '#666'}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    flex1: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
    },
    headerStatus: {
        fontSize: 12,
        color: '#1DB954',
        marginTop: 2,
    },
    moreButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
        marginBottom: 8,
    },
    imageBubble: {
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#1DB954',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#2C2C2C',
        borderBottomLeftRadius: 4,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 14,
        resizeMode: 'cover',
    },
    messageText: {
        fontSize: 15,
        color: '#E0E0E0',
        lineHeight: 20,
    },
    myMessageText: {
        color: '#ffffff',
    },
    messageTime: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    typingBubble: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#888',
    },
    dot1: {
        opacity: 0.4,
    },
    dot2: {
        opacity: 0.6,
    },
    dot3: {
        opacity: 0.8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingTop: 10,
        backgroundColor: '#1E1E1E',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    attachButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#2C2C2C',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: colors.white,
        maxHeight: 100,
        marginHorizontal: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2C2C2C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonActive: {
        backgroundColor: '#1DB954',
    },
});

export default ChatScreen;
