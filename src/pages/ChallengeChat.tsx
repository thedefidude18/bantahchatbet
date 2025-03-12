import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Image, Paperclip, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'evidence';
  created_at: string;
  sender: {
    name: string;
    avatar_url: string;
  };
}

interface ChallengeDetails {
  id: string;
  title: string;
  amount: number;
  status: string;
  challenger: {
    id: string;
    name: string;
    avatar_url: string;
  };
  challenged: {
    id: string;
    name: string;
    avatar_url: string;
  };
}

const ChallengeChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [challenge, setChallenge] = useState<ChallengeDetails | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchChallengeDetails();
    fetchMessages();
    subscribeToNewMessages();
  }, [id]);

  const fetchChallengeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenger:challenger_id(*),
          challenged:challenged_id(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setChallenge(data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      toast.showError('Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_messages')
        .select(`
          *,
          sender:sender_id(*)
        `)
        .eq('challenge_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.showError('Failed to load messages');
    }
  };

  const subscribeToNewMessages = () => {
    const subscription = supabase
      .channel(`challenge_${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'challenge_messages',
        filter: `challenge_id=eq.${id}`
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('challenge_messages')
        .insert({
          challenge_id: id,
          sender_id: currentUser.id,
          content: message,
          type: 'text'
        });

      if (error) throw error;
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.showError('Failed to send message');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('challenge-evidence')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('challenge-evidence')
        .getPublicUrl(fileName);

      await supabase
        .from('challenge_messages')
        .insert({
          challenge_id: id,
          sender_id: currentUser?.id,
          content: publicUrl,
          type: 'evidence'
        });

      toast.showSuccess('Evidence uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.showError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-screen bg-[#1A1B2E]">
      {/* Header */}
      <div className="bg-[#242538] p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <h1 className="text-white font-semibold">{challenge?.title}</h1>
            <p className="text-[#CCFF00] text-sm">₦{challenge?.amount?.toLocaleString()}</p>
          </div>
        </div>

        <button 
          onClick={() => {/* Handle support request */}}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Request Support"
        >
          <Shield className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender_id === currentUser?.id ? 'flex-row-reverse' : ''
            }`}
          >
            <img
              src={msg.sender.avatar_url}
              alt={msg.sender.name}
              className="w-8 h-8 rounded-full"
            />
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender_id === currentUser?.id
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-[#242538] text-white'
              }`}
            >
              {msg.type === 'evidence' ? (
                <img
                  src={msg.content}
                  alt="Evidence"
                  className="rounded-lg max-w-full"
                />
              ) : (
                <p>{msg.content}</p>
              )}
              <span className="text-xs opacity-60 mt-1 block">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#242538] p-4">
        <div className="flex items-center gap-2">
          <label className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Image className="w-5 h-5 text-white" />
          </label>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#1A1B2E] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-[#CCFF00]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeChat;