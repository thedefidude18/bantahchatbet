import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Smile, Loader } from 'lucide-react';
import { useAuth, AuthUser } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import UserAvatar from './UserAvatar';
import { useEventChat } from '../hooks/useEventChat';
import ChatBubble from './ChatBubble';
import { formatDistanceToNow } from 'date-fns';
import ProfileCard from './ProfileCard';

import { useProfile } from '../hooks/useProfile';
export interface NewEventChatProps {
  eventId: string;
  eventName: string;
  eventCreatorUsername: string;
  eventPoolAmount: number;
  eventStartTime: string;
  eventEndTime: string;
  numberOfMembers: number;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender?: {
    username: string;
    avatar_url: string;
    isVerified?: boolean;
  };
  reactions?: { [key: string]: string[] };
}

const CompactBanner: React.FC<{ eventPoolAmount: number; countdown: string }> = (
  {
  eventPoolAmount,
  countdown,
}) => (
  <div className="bg-purple-700 text-white rounded-xl shadow-md m-2 overflow-hidden">
    <div className="flex flex-col items-center justify-center p-3">
      <p className="text-sm font-semibold mb-1">Omah Lay will drop a new</p>
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <div className="bg-green-500 text-white rounded-full px-3 py-1 text-xs font-semibold flex items-center justify-center w-16 h-8">
            YES 55
          </div>
        </div>
        <div className="flex items-center">
          <div className="bg-red-500 text-white rounded-full px-3 py-1 text-xs font-semibold flex items-center justify-center w-16 h-8">
            NO 16
          </div>
        </div>
      </div>
      <div className="flex items-center mt-2 text-xs text-white">
        <span className="mr-2">Event Pool ₦ {(eventPoolAmount / 1000).toFixed(1)}K</span>
        <span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block h-3 w-3 mr-1 align-text-top"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {countdown}
        </span>
      </div>
    </div>
  </div>
);

const NewEventChat: React.FC<NewEventChatProps> = ({
  eventId,
  eventName,
  eventCreatorUsername,
  eventPoolAmount,
  eventEndTime,
  numberOfMembers,
  onBack,
}) => {  const { getProfile } = useProfile();
  const { currentUser } = useAuth();
  const toast = useToast();
  const { messages, sendMessage, isLoading } = useEventChat(eventId);

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedProfile, setSelectedProfile] = useState<ChatMessage['sender'] | null>(null);
  const [countdown, setCountdown] = useState('');

  const [creatorAvatar, setCreatorAvatar] = useState<string | null>(null);
  const isCurrentUserAdmin = currentUser?.username === eventCreatorUsername;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentUser) {
      const success = await sendMessage(message.trim());
      if (!success) {
        toast.showError('Failed to send message');
      }
      setMessage('');
    }
  };

  const openProfileCard = (sender: ChatMessage['sender']) => {
    setSelectedProfile(sender);
  };

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      const profile = await getProfile(eventCreatorUsername);
      if (profile) {
        setCreatorAvatar(profile.avatar_url);
      }
    };

    fetchCreatorProfile();
  }, [eventCreatorUsername, getProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const updateCountdown = () => {
      try {
        const endTime = new Date(eventEndTime);
        const now = new Date();
        if (!isNaN(endTime.getTime())) {
          if (endTime > now) {
            const diff = endTime.getTime() - now.getTime();
            const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
            const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
            setCountdown(`${hours}h ${minutes}m ${seconds}s`);
          } else {
            setCountdown('Event ended');
          }
        } else {
          setCountdown('Invalid end time');
        }
      } catch (error) {
        console.error('Error parsing event end time:', error);
        setCountdown('Error');
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [eventEndTime]);

  return (
    <div className="flex flex-col h-screen bg-purple-50">
      {/* Top Bar */}
      <div className="bg-purple-700 text-white p-3 flex items-center shadow-sm z-10 rounded-br-xl">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center">
          <UserAvatar url={creatorAvatar || '/bantahlogo.png'} size="sm" />
          <div className="ml-2">
            <h6 className="font-semibold">{eventName}</h6>
            <p className="text-xs text-purple-200 flex items-center">
            <img
                src={creatorAvatar || "/bantahlogo.png"}
                alt={eventCreatorUsername}
                className="w-4 h-4 rounded-full object-cover mr-1"
              />
              <span>{eventCreatorUsername} • {numberOfMembers} Members</span>
            </p>
          </div>
        </div>

  
      <div className="ml-auto">
          <span className="bg-purple-600 text-white rounded-full px-2 py-1 text-xs font-semibold">
            ₦ {(eventPoolAmount / 1000).toFixed(1)}K
          </span>
        </div>
      </div>

      {/* Compact Banner with YES/NO and Event Info */}
      <CompactBanner eventPoolAmount={eventPoolAmount} countdown={countdown} />

      {/* Chat Messages Area */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2">
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin text-purple-700" size={32} />
          </div>
        )}
        {!isLoading &&
          messages.map((msg: ChatMessage) => {
            const isCurrentUserSender = msg.sender_id === currentUser?.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'} items-start mb-2`}
              >
                {!isCurrentUserSender && msg.sender && (
                  <div className="mr-2 cursor-pointer" onClick={() => openProfileCard(msg.sender!)}>
                    <UserAvatar url={msg.sender.avatar_url} size="sm" />
                  </div>
                )}
                <div className="flex flex-col">
                  <div className={`${isCurrentUserSender ? 'items-end' : 'items-start'}`}>
                    {!isCurrentUserSender && msg.sender?.username && (
                      <span className="text-xs text-gray-500 mb-0.5">@{msg.sender.username}</span>
                    )}
                    <ChatBubble
                      content={msg.content}
                      timestamp={msg.created_at}
                      isSender={isCurrentUserSender}
                      senderName={!isCurrentUserSender ? msg.sender?.username : undefined}
                      hasAvatar={!isCurrentUserSender}
                    />
                  </div>
                </div>
                {isCurrentUserSender && currentUser?.avatar_url && (
                  <div className="ml-2">
                    <UserAvatar url={currentUser.avatar_url} size="sm" />
                  </div>
                )}
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Profile Card Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            <ProfileCard
              profile={{
                ...selectedProfile,
                id: selectedProfile.username,
                name: selectedProfile.username,
                bio: '',
                is_following: false,
                followers_count: 0,
                avatar_url: selectedProfile.avatar_url,
              }}
              onClose={() => setSelectedProfile(null)}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 flex items-center space-x-2 sticky bottom-0">        
        <button className="text-gray-500 hover:text-purple-700 p-2 rounded-full">
          <Smile size={20} />
        </button>
        <form onSubmit={handleSubmit} className="flex-grow relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Start a message"
            className="bg-gray-100 rounded-full p-2 px-4 focus:outline-none focus:ring-1 focus:ring-purple-500 flex-grow text-sm pr-10"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-700 text-white rounded-full p-2 hover:bg-purple-800 disabled:opacity-50"
            disabled={!message.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewEventChat;