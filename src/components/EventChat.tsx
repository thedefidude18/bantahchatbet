import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import UserAvatar from './UserAvatar';
import BetConfirmationModal from './BetConfirmationModal';

interface EventChatProps {
  event: {
    id: string;
    title: string;
    description: string;
    pool?: { total_amount: number };
    participants?: Array<{ user_id: string; prediction: boolean }>;
    creator: { id: string; username: string; matches_won?: number };
    wagerAmount: number;
    endTime: string;
  };
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

// Placeholder hook — real logic will come later
const useEventChat = (eventId: string) => ({
  messages: [] as Message[],
  sendMessage: async (msg: string) => false,
  isLoading: false,
  isConnected: true,
});

const ModernEventChat: React.FC<EventChatProps> = ({ event, onClose }) => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const { messages, sendMessage, isConnected } = useEventChat(event.id);

  const [message, setMessage] = useState('');
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<'YES' | 'NO' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) {
      if (!isConnected) toast.showError('Chat is disconnected');
      return;
    }

    const currentMessage = message.trim();
    setMessage('');
    const success = await sendMessage(currentMessage);

    if (!success) {
      setMessage(currentMessage);
      toast.showError('Message not delivered. Try again.');
    }
  };

  const handlePredictionClick = (prediction: 'YES' | 'NO') => {
    setSelectedPrediction(prediction);
    setShowBetModal(true);
  };

  const handleConfirmBet = async () => {
    try {
      // Placeholder: betting logic
      setShowBetModal(false);
      toast.showSuccess('Bet placed successfully!');
    } catch (error) {
      console.error(error);
      toast.showError('Bet failed');
    }
  };

  if (!currentUser) {
    return <div className="text-center p-4">Please login to participate in chat</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">{event.title}</h2>
        <div />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${msg.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender.id !== currentUser?.id && (
              <UserAvatar user={msg.sender} className="w-8 h-8" />
            )}
            <div className={`rounded-xl px-4 py-2 max-w-xs text-sm ${msg.sender.id === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
              <span className="block">{msg.content}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input + action buttons */}
      <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2 bg-white">
        <button
          type="button"
          onClick={() => handlePredictionClick('YES')}
          className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-green-200"
        >
          <CheckCircle size={16} /> Buy YES
        </button>
        <button
          type="button"
          onClick={() => handlePredictionClick('NO')}
          className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-red-200"
        >
          <XCircle size={16} /> Buy NO
        </button>
      </form>

      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 items-center bg-gray-50">
        <input
          type="text"
          className="flex-1 rounded-full px-4 py-2 border text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2">
          <Send size={18} />
        </button>
      </form>

      {/* Bet Modal */}
      {showBetModal && selectedPrediction && (
        <BetConfirmationModal
          open={showBetModal}
          onClose={() => setShowBetModal(false)}
          onConfirm={handleConfirmBet}
          prediction={selectedPrediction}
          amount={event.wagerAmount}
        />
      )}
    </div>
  );
};

export default EventChat;
