import { useRef, RefObject, useEffect } from 'react';
import { Button, FormControl, ListGroup } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import UserAvatar from './UserAvatar';

interface MessageGroup {
  date: string;
  messages: IMessage[];
}

interface ChatMessagesViewProps {
  selectedChat: string;
  user?: string;
  messages: IMessage[];
  messageText: string;
  setMessageText: (text: string) => void;
  sendMessage: (message: string) => void;
  groupMessagesByDate: (messages: IMessage[]) => MessageGroup[];
  formatTime: (datetime: string) => string;
  onBack: () => void;
}

export const ChatMessagesView = ({
  selectedChat,
  user,
  messages,
  messageText,
  setMessageText,
  sendMessage,
  groupMessagesByDate,
  formatTime,
  onBack
}: ChatMessagesViewProps) => {
  const messageListRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="messages-container">
      <div className="messages-header">
        <Button variant="link" onClick={onBack} className="back-button">
          <FaArrowLeft />
        </Button>
        <div className="selected-user-info">
          <UserAvatar username={selectedChat} />
          <span className="selected-username">{selectedChat}</span>
        </div>
      </div>

      <div className="messages-content">
        <div className="message-list" ref={messageListRef}>
          <ListGroup>
            {/* This section groups messages by date, then renders each date’s messages */}
            {groupMessagesByDate(messages).map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="date-separator">
                  <span>{group.date}</span>
                </div>
                {group.messages.map((message, messageIndex) => (
                  <ListGroup.Item
                    key={messageIndex}
                    className={`message-item ${
                      message.from === user ? 'right' : 'left'
                    }`}
                  >
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">
                      {formatTime(message.datetime)}
                    </div>
                  </ListGroup.Item>
                ))}
              </div>
            ))}
          </ListGroup>
        </div>
      </div>

      <div className="input-group">
        {/* The input field handles sending a new message on "Enter" or on button click */}
        <FormControl
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && messageText.trim()) {
              sendMessage(messageText);
            }
          }}
        />
        <Button
          variant="primary"
          onClick={() => sendMessage(messageText)}
          disabled={!messageText.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

interface IMessage {
  from: string;
  to: string;
  text: string;
  datetime: string;
}
