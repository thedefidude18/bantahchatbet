import React, { useState } from 'react';
import { Lock, Users, Clock, MessageCircle, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types/event';
import JoinRequestModal from './JoinRequestModal';
import { toast } from 'react-toastify';
import { generateEventOGData } from '../utils/opengraph';
import NewEventChat from './NewEventChat';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop';

interface EventCardProps {
  event: Event;
  onChatClick: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onChatClick }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

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
      setShowChat(true);
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

  const handleCloseChat = () => {
    setShowChat(false);
  };

  return (
    <>
      <div className="bg-black rounded-3xl overflow-hidden relative">
        {/* Full image background */}
        <div className="relative w-full aspect-video">
          <img
            src={event.banner_url || DEFAULT_BANNER}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_BANNER;
            }}
          />
          {/* Shortened, fading top overlay for title and creator badge */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent pt-3 pb-1.5 flex flex-col items-center">
            {isActive && (
              <div className="flex items-center mb-0.5">
                <div className="bg-indigo-600 rounded-full flex items-center gap-0.5 px-1.5 py-0.75">
                  <div className="bg-white rounded-full h-2.5 w-2.5 flex items-center justify-center">
                    <div className="text-indigo-600 text-[0.5rem] font-bold">✓</div>
                  </div>
                  <span className="text-white font-bold text-[0.7rem]">LIVE</span>
                </div>
              </div>
            )}
            <h2 className="text-white text-lg font-bold leading-tight text-center mb-1">
              {event.title}
            </h2>
            <div className="bg-orange-500 rounded-full flex items-center px-1.5 py-0.75">
              <div className="overflow-hidden rounded-full h-4 w-4">
                <img
                  src={event.creator.avatar || "/default-avatar.png"}
                  alt={event.creator.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-bold ml-0.5 text-[0.7rem]">
                {event.creator.username || "mikki24"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            {/* Event Pool section */}
            <div className="flex flex-col">
              <span className="text-white text-xl font-bold">Event Pool</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-white rounded-full px-3 py-1.5">
                  <span className="text-black font-bold text-sm">
                    ₦{event.pool?.total_amount?.toLocaleString() || '2,500.00'}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="overflow-hidden rounded-full h-5 w-5 bg-orange-500 flex items-center justify-center">
                    <img
                      src={event.participants?.[0]?.avatar || event.creator.avatar || "/default-avatar.png"}
                      alt="Participant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white font-bold ml-1 text-xs">+{event.participants?.length || 65}</span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinClick}
              className={`bg-[#CCFF00] hover:bg-[#B8E600] text-black font-bold text-xl px-6 py-2 rounded-xl flex items-center justify-center gap-1 ${event.is_private ? '' : ''}`}
            >
              {event.is_private && <Lock className="h-4 w-4" />}
              Join
            </button>
          </div>
        </div>
      </div>

      <JoinRequestModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={() => {
          setShowJoinModal(false);
          setShowChat(true);
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

      {showChat && <NewEventChat eventId={event.id} onClose={handleCloseChat} />}
    </>
  );
};

export default EventCard;