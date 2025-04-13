import React, { useState, useEffect, useRef } from 'react';
import defaultAvatar from '../../public/avatar.svg';
import { Camera, Paperclip, Image } from 'phosphor-react';
import { Smile } from 'lucide-react';

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(''); // State for tracking typing text

  interface MessageType {
    id: string;
    sender: 'self' | 'other';
    content: string;
    timestamp: string;
    reactions?: { like: number; heart: number };
    replies?: number;
    senderName: string;
    avatarUrl: string;
  }

  interface Chat {
    id: number;
    username: string;
    message: string;
    timestamp: string;
    avatarUrl: string;
    hasNewMessages: boolean;
    newMessagesCount: number;
  }

  useEffect(() => {
    const initialMessages: Message[] = [
      { id: '1', sender: 'other', senderName: 'Habibi_247', avatarUrl: defaultAvatar, content: 'Hello, who won?', timestamp: 'Friday 5:50pm', reactions: { like: 0, heart: 0 }, replies: 0 },
      { id: '2', sender: 'other', senderName: 'king-bettohk2', avatarUrl: defaultAvatar, content: 'we lost!!!!!!!! Bro!', timestamp: 'Friday 5:50pm', reactions: { like: 0, heart: 0 }, replies: 0 },
      { id: '3', sender: 'other', senderName: 'bingogees', avatarUrl: defaultAvatar, content: 'Hello, who won?', timestamp: 'Friday 5:50pm', reactions: { like: 12, heart: 0 }, replies: 0 },
      { id: '4', sender: 'other', senderName: 'bingogees', avatarUrl: defaultAvatar, content: 'Hello, who won?', timestamp: 'Friday 5:50pm', reactions: { like: 12, heart: 0 }, replies: 0 },
    ];
    setMessages(initialMessages);
  }, []);
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (text.trim() !== '') {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newMessageObj: Message = {
        id: Date.now().toString(),
        sender: 'self',
        senderName: 'You',
        avatarUrl: defaultAvatar,
        content: text,
        text: text,
        timestamp,
      };
      setMessages([...messages, newMessageObj]);
      setNewMessage(''); // Clear the input field
    }
  };

  const handleSendMessage = () => {
    sendMessage(newMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  interface Message {
    id: string;
    sender: 'self' | 'other';
    senderName: string;
    avatarUrl: string;
    content: string;
    timestamp: string;
    reactions?: { like: number; heart: number };
    replies?: number;
  }
  const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
    const isOther = message.sender === 'other';
    return (
      <div className={`flex ${isOther ? 'justify-start' : 'justify-end'} items-start my-2`}>
        {isOther && (
          <img src={message.avatarUrl} alt={message.senderName} className="w-8 h-8 rounded-full mr-2" />
        )}
        <div className="flex flex-col">
          {isOther && <span className="text-xs font-bold">{message.senderName}</span>}
          <div className={`py-2 px-3 rounded-lg ${isOther ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-blue-500 text-white rounded-tr-none'}`}>
            <p className="text-sm">{message.content}</p>
          </div>
          <div className="flex items-center mt-1">
            {message.reactions && message.reactions.like > 0 && (
              <span className="text-xs text-gray-500 mr-2">
                👍 {message.reactions.like}
              </span>
            )}
            {message.reactions && message.reactions.heart > 0 && (
              <span className="text-xs text-gray-500 mr-2">
                ❤️ {message.reactions.heart}
              </span>
            )}
            <span className="text-xs text-gray-500">{message.timestamp}</span>
          </div>
        </div>
        {!isOther && (
          <img src={message.avatarUrl} alt="You" className="w-8 h-8 rounded-full ml-2" />
        )}
      </div>
    );
  };

  const MessageInput: React.FC = () => (
    <div className="bg-white py-2 px-4 flex items-center border-t border-gray-200">
      <button className="text-gray-400 mr-2">
        <Smile size={20} />
      </button>
      <input
        type="text"
        className="flex-1 py-2 px-3 rounded-full bg-gray-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-300"
        placeholder="Start a message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="text-gray-400 ml-2">
        <Paperclip size={20} />
      </button>
      <button className="text-gray-400 ml-2">
        <Image size={20} />
      </button>
      <button className="text-gray-400 ml-2">
        <Camera size={20} />
      </button>
      <button
        onClick={handleSendMessage}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full ml-2 focus:outline-none focus:shadow-outline"
      >
        Send
      </button>
    </div>
  );

  const placeholderMessages: Message[] = [
    { id: '1', sender: 'other', senderName: 'Habibi_247', avatarUrl: defaultAvatar, content: 'Hello, who won?', timestamp: 'Friday 5:50pm', reactions: { like: 0, heart: 0 }, replies: 0 },
    { id: '2', sender: 'other', senderName: 'king-bettohk2', avatarUrl: defaultAvatar, content: 'we lost!!!!!!!! Bro!', timestamp: 'Friday 5:50pm', reactions: { like: 0, heart: 0 }, replies: 0 },
    { id: '3', sender: 'other', senderName: 'bingogees', avatarUrl: defaultAvatar, content: 'Hello, who won?', timestamp: 'Friday 5:50pm', reactions: { like: 12, heart: 0 }, replies: 0 },
    { id: '4', sender: 'other', senderName: 'bingogees', avatarUrl: defaultAvatar, content: 'Hello, who won?', timestamp: 'Friday 5:50pm', reactions: { like: 12, heart: 0 }, replies: 0 },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header (Placeholder) */}
      <header className="bg-purple-600 text-white py-3 px-4">
        <h1 className="text-lg font-semibold text-center">@bingogoes</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        {placeholderMessages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};
export default Messages