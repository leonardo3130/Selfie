import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/authContext';
import '../css/chat.css';
import { ChatListView } from './ChatListView';
import { ChatSearchView } from './ChatSearchView';
import { ChatMessagesView } from './ChatMessagesView';

interface MessageGroup {
    date: string;
    messages: IMessage[];
}

export const Chat = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [activeChats, setActiveChats] = useState<string[]>([]);
    const [allMessages, setAllMessages] = useState<IMessage[]>([]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [view, setView] = useState<'chats' | 'search' | 'messages'>('chats');
    const [messageText, setMessageText] = useState<string>('');
    const messageListRef = useRef<HTMLDivElement>(null);
    
    const { user } = useContext(AuthContext);
    
    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };

    // This effect runs when the chat is open and the user is authenticated to fetch messages periodically
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (user?._id && isOpen) {
            const fetchMessages = () => {
                fetch(`/api/messages/get/${user?._id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        credentials: "include",
                    }
                })
                    .then((response) => response.json())
                    .then((data: IMessage[]) => {
                        const sortedMessages = [...data].sort((a, b) =>
                            new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
                        );

                        const uniqueUsers = new Set<string>();
                        const orderedChats: string[] = [];

                        sortedMessages.forEach((message) => {
                            const otherUser = message.from === user?.username ? message.to : message.from;
                            if (!uniqueUsers.has(otherUser) && otherUser !== user?.username) {
                                uniqueUsers.add(otherUser);
                                orderedChats.push(otherUser);
                            }
                        });

                        setActiveChats(orderedChats);
                        setAllMessages(data);

                        if (selectedChat) {
                            const filteredMessages = data.filter(
                                (message) =>
                                    (message.from === user?.username && message.to === selectedChat) ||
                                    (message.from === selectedChat && message.to === user?.username)
                            );
                            // This function filters and sets messages for the selected chat
                            setMessages(filteredMessages);
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching messages:', error);
                    });
            };

            fetchMessages();
            interval = setInterval(fetchMessages, 3000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [user?._id, isOpen, selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, view]);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value: string = e.target.value;
        setSearchTerm(value);

        if (value.length > 2) {
            try {
                const response = await fetch('/api/users/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        credentials: "include",
                    },
                    body: JSON.stringify({ substring: value })
                });

                if (!response.ok) {
                    throw new Error('Search failed');
                }

                const data = await response.json();
                setSearchResults(data.matchedUsernames);
            } catch (error) {
                console.error('Error searching users:', error);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    // This toggles the chat window view on or off
    const toggleChatWindow = () => {
        setIsOpen(!isOpen);
        setView('chats');
    };

    const handleUserClick = (username: string): void => {
        setSelectedChat(username);
        setView('messages');
        loadMessages(username);
    };

    const handleChatClick = (chatId: string): void => {
        setSelectedChat(chatId);
        setView('messages');
        loadMessages(chatId);
    };

    const loadMessages = (chatId: string) => {
        const filteredMessages = allMessages.filter(
            (message) =>
                (message.from === user?.username && message.to === chatId) ||
                (message.from === chatId && message.to === user?.username)
        );
        setMessages(filteredMessages);
    };

    // This sends a new message to the server and updates the local messages
    const sendMessage = (message: string) => {
        if (!user?.username || !selectedChat || !message.trim()) return;

        fetch(`/api/messages/send/${user?._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                credentials: "include",
            },
            body: JSON.stringify({ text: message, to: selectedChat })
        })
            .then((response) => response.json())
            .then((data: IMessage) => {
                setMessages(prev => [...prev, data]);
                setAllMessages(prev => [...prev, data]);
                setMessageText('');
                scrollToBottom();
            })
            .catch((error) => {
                console.error('Error sending message:', error);
            });
    };

    const formatTime = (datetime: string) => {
        const date = new Date(datetime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const groupMessagesByDate = (messages: IMessage[]): MessageGroup[] => {
        const groups: { [key: string]: IMessage[] } = {};

        messages.forEach(message => {
            const date = new Date(message.datetime);
            const dateStr = date.toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(message);
        });

        return Object.entries(groups).map(([date, messages]) => ({
            date,
            messages
        }));
    };

    return (
        <>
            <button className="chat-button" onClick={toggleChatWindow}>
                💬
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        {view === 'chats' && (
                            <>
                                <ChatSearchView
                                    searchTerm={searchTerm}
                                    searchResults={searchResults}
                                    onSearchChange={handleSearchChange}
                                    onUserClick={handleUserClick}
                                    onBlur={() => {
                                        setTimeout(() => {
                                            if (!searchTerm) setView('chats');
                                        }, 200);
                                    }}
                                />
                                <ChatListView
                                    activeChats={activeChats}
                                    allMessages={allMessages}
                                    currentUser={user?.username}
                                    onChatClick={handleChatClick}
                                />
                            </>
                        )}

                        {view === 'search' && (
                            <ChatSearchView
                                searchTerm={searchTerm}
                                searchResults={searchResults}
                                onSearchChange={handleSearchChange}
                                onUserClick={handleUserClick}
                                onBlur={() => {
                                    setTimeout(() => {
                                        if (!searchTerm) setView('chats');
                                    }, 200);
                                }}
                            />
                        )}

                        {view === 'messages' && selectedChat && (
                            <ChatMessagesView
                                selectedChat={selectedChat}
                                user={user?.username}
                                messages={messages}
                                messageText={messageText}
                                setMessageText={setMessageText}
                                sendMessage={sendMessage}
                                groupMessagesByDate={groupMessagesByDate}
                                formatTime={formatTime}
                                onBack={() => setView('chats')}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

interface IMessage {
    from: string;
    to: string;
    text: string;
    datetime: string;
}
