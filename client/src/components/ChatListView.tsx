import { ListGroup } from 'react-bootstrap';
import UserAvatar from './UserAvatar';

interface ChatListViewProps {
    activeChats: string[];
    allMessages: IMessage[];
    currentUser?: string;
    onChatClick: (chatId: string) => void;
}

export const ChatListView = ({
    activeChats,
    allMessages,
    currentUser,
    onChatClick,
}: ChatListViewProps) => {
    return (
        <div className="active-chats-container">
            <h5 className="active-chats-title">Active Chats</h5>
            <ListGroup>
                {activeChats.map((chatId, index) => (
                    <ListGroup.Item
                        key={index}
                        action
                        onClick={() => onChatClick(chatId)}
                        className="chat-list-item"
                    >
                        <UserAvatar username={chatId} />

                        <div className="chat-info">
                            <div className="chat-username">{chatId}</div>
                            <div className="chat-preview">
                                {allMessages
                                    .filter(
                                        (msg) =>
                                            (msg.from === chatId && msg.to === currentUser) ||
                                            (msg.to === chatId && msg.from === currentUser)
                                    )
                                    .slice(-1)[0]?.text.slice(0, 35) || 'No messages yet'}
                            </div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

interface IMessage {
    from: string;
    to: string;
    text: string;
    datetime: string;
}
