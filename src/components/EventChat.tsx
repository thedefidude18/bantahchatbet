import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Users, Clock, MoreVertical, ArrowLeft, Check, X as XIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';
import BetConfirmationModal from './BetConfirmationModal';
import { useEventChat } from '../hooks/useEventChat';
import { format } from 'date-fns';
import { useToast } from '../hooks/useToast';

interface EventChatProps {
  event: {
    id: string;
    title: string;
    description: string;
    pool?: {
      total_amount: number;
    };
    participants?: Array<{
      user_id: string;
      prediction: boolean;
    }>;
    creator: {
      id: string;
      username: string;
      matches_won?: number;
    };
    wagerAmount: number;
    endTime: string;
  };
  onClose: () => void;
}

const EventChat: React.FC<EventChatProps> = React.memo(({ event, onClose }) => {
  const { messages, sendMessage, isLoading, isConnected } = useEventChat(event.id);
  const { currentUser } = useAuth();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<'YES' | 'NO' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handlePredictionClick = (prediction: 'YES' | 'NO') => {
    setSelectedPrediction(prediction);
    setShowBetModal(true);
  };

  const handleConfirmBet = async () => {
    try {
      // Implement your bet confirmation logic here
      // For example:
      // await placeBet(event.id, selectedPrediction, event.wagerAmount);
      setShowBetModal(false);
      toast.showSuccess('Bet placed successfully!');
    } catch (error) {
      console.error('Failed to place bet:', error);
      toast.showError('Failed to place bet');
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) {
      if (!isConnected) {
        toast.showError('Chat is disconnected. Please wait...');
      }
      return;
    }

    const currentMessage = message.trim();
    setMessage(''); // Clear input optimistically

    try {
      const success = await sendMessage(currentMessage);
      if (!success) {
        setMessage(currentMessage); // Restore message if failed
        toast.showError('Message not delivered. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.showError('Failed to send message');
      setMessage(currentMessage); // Restore message
    }
  };

  if (!currentUser) {
    return <div className="text-center p-4">Please login to participate in chat</div>;
  }
  return (
    <div className="flex flex-col h-full">
      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 text-sm flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
          Connecting to chat...
        </div>
      )}

      {/* Header */}
      <div className="bg-[#242538] border-b border-white/10">
        <div className="h-14 px-4 flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.creator.id}`}
            alt={event.creator.username}
            className="w-8 h-8 rounded-full"
          />

          <div className="flex-1 min-w-0">
            <h2 className="text-white font-medium truncate">{event.title}</h2>
            <div className="flex items-center gap-4 text-white/60 text-xs">
              <span>@{event.creator.username} • {event.creator.matches_won || 0} wins</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {event.participants?.length || 0} 
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  2h 30m left
                </span>
                <span>${event.pool?.total_amount?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Yes/No Buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={() => handlePredictionClick('YES')}
              className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors text-xs font-medium"
              title="Yes"
            >
              YES
            </button>
            <button
              onClick={() => handlePredictionClick('NO')}
              className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors text-xs font-medium"
              title="No"
            >
              NO
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 bg-[#f8fafc] dark:bg-[#1a1b2e] space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-text"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-light-text dark:text-black/60">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender.id === currentUser?.id;
            
            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <img
                  src={msg.sender.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.id}`}
                  alt={msg.sender.username}
                  className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
                />
                
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {/* Username and Time */}
                  <div className={`flex items-center gap-1 text-[10px] leading-none mb-0.5 ${
                    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <span className="font-medium text-black/90">
                      {msg.sender.username}
                    </span>
                    <span className="text-black/40">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div 
                    className={`px-3 py-1.5 rounded-2xl break-words leading-snug ${
                      isOwnMessage 
                        ? 'bg-[#CCFF00] text-black rounded-br-sm' 
                        : 'bg-[#2C2D44] text-white/90 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-light-card dark:bg-dark-card border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting to chat..."}
            disabled={!isConnected}
            className="flex-1 bg-[#1a1b2e] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Modals */}
      {showBetModal && (
        <BetConfirmationModal
          isOpen={showBetModal}
          onClose={() => setShowBetModal(false)}
          onConfirm={handleConfirmBet}
          prediction={selectedPrediction}
          event={event}
        />
      )}
    </div>
  );
});

EventChat.displayName = 'EventChat';

export default EventChat;
