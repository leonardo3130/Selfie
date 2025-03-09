import { FormControl, ListGroup } from 'react-bootstrap';
import UserAvatar from './UserAvatar';

interface ChatSearchViewProps {
  searchTerm: string;
  searchResults: string[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserClick: (username: string) => void;
  onBlur?: () => void;
}

export const ChatSearchView = ({
  searchTerm,
  searchResults,
  onSearchChange,
  onUserClick,
  onBlur,
}: ChatSearchViewProps) => {
  return (
    <>
      {/* This controlled input updates searchTerm and triggers user search on change */}
      <FormControl
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={onSearchChange}
        onBlur={onBlur}
        style={{ marginBottom: '10px' }}
      />
      <ListGroup>
        {/* The mapped ListGroup items represent each found username */}
        {searchResults.map((username, index) => (
          <ListGroup.Item
            key={index}
            action
            onClick={() => onUserClick(username)}
            className="chat-list-item"
          >
            <UserAvatar username={username} />
            <div className="chat-info">
                <div className="chat-username">{username}</div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
};
