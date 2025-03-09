import { generateColorFromString } from '../utils/colorUtils';

const UserAvatar = ({ username }: { username: string }) => {
    return (
        <div className="chat-avatar" style={{ backgroundColor: generateColorFromString(username) }}>
            {username.charAt(0).toUpperCase()}
        </div>
    );
};

export default UserAvatar;