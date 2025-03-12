import React, { useState } from 'react';
import { Lock, Users, Clock, Trophy, MessageCircle, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types/event';
import JoinRequestModal from './JoinRequestModal';
import { toast } from 'react-toastify';
import { generateEventOGData } from '../utils/opengraph';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop';

interface EventCardProps {
  event: Event;
  onJoin: (event: Event) => void;
  onChatClick: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onJoin, onChatClick }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const isActive = React.useMemo(() => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    return now >= startTime && now <= endTime;
  }, [event.start_time, event.end_time]);

  const getTimeLeft = () => {
    const now = new Date();
    const end = new Date(event.end_time);
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleJoinClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (event.is_private) {
      setShowJoinModal(true);
    } else {
      onJoin(event);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick(event);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const eventData = generateEventOGData(event);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventData.title,
          text: eventData.description,
          url: eventData.url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(eventData.url);
        toast.success('Event link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy event link');
      }
    }
  };

  return (
    <>
      <div className="bg-[#242538] rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-200 relative">
        {/* Category Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-[#7C3AED] px-2 py-0.5 rounded-full text-white text-xs">
            {event.category}
          </span>
        </div>

        <div className="flex flex-col">
          {/* Banner with Gradient Overlay */}
          <div className="relative w-full h-32">
            <img
              src={event.banner_url || DEFAULT_BANNER}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_BANNER;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#242538] via-transparent to-transparent" />
            
            {/* Live Badge */}
            {isActive && (
              <div className="absolute top-2 left-2">
                <div className="bg-[#CCFF00] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                  <span className="text-black text-[10px] font-medium">LIVE</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            {/* Title Row */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-white font-medium line-clamp-2 leading-tight">
                  {event.title}
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  by @{event.creator.username}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleShareClick}
                  className="p-1.5 rounded-lg bg-[#2D2E4A] hover:bg-[#373860] text-white"
                  aria-label="Share event"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleChatClick}
                  className="p-1.5 rounded-lg bg-[#2D2E4A] hover:bg-[#373860] text-white"
                  aria-label="Open chat"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats and Pool Amount Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.participants?.length || 0}/{event.max_participants || '∞'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeLeft()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#CCFF00] font-medium">
                  ₦{event.pool?.total_amount?.toLocaleString() || '0'}
                </p>
                <p className="text-white/60 text-xs">Pool Amount</p>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinClick}
              className="w-full py-1.5 rounded-lg font-medium text-sm bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center gap-1.5"
            >
              {event.is_private && <Lock className="w-4 h-4" />}
              {event.is_private ? 'Request to Join' : 'Join Event'}
            </button>
          </div>
        </div>
      </div>

      <JoinRequestModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={() => {
          setShowJoinModal(false);
          onJoin(event);
        }}
        eventTitle={event.title}
        wagerAmount={event.pool?.total_amount || 0}
        creator={event.creator}
        eventDetails={{
          category: event.category,
          startTime: event.start_time,
          maxParticipants: event.max_participants,
          currentParticipants: event.current_participants || 0
        }}
      />
    </>
  );
};

export default EventCard;
