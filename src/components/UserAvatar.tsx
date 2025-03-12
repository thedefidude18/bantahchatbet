import React from 'react';

interface UserAvatarProps {
  url?: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  url, 
  username, 
  size = 'md',
  isSelected = false 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]}`}>
      {isSelected && (
        <div className="absolute inset-0 border-2 border-purple-500 rounded-full z-10" />
      )}
      <img
        src={url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
        alt={`${username}'s avatar`}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default UserAvatar;
