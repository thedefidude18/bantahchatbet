import React, { useState } from 'react';
import { useEvent } from '../hooks/useEvent';
import { useToast } from '../contexts/ToastContext';
import EventCard from '../components/EventCard';
import EventChat from '../components/EventChat';
import LoadingSpinner from '../components/LoadingSpinner';
import MobileFooterNav from '../components/MobileFooterNav';
import Header from '../components/Header';
import { Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  category: string;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
  };
  is_private: boolean;
  creator_id: string;
  end_time: string;
  wager_amount: number;
  max_participants: number;
  current_participants: number;
  start_time: string;
  pool?: {
    total_amount: number;
  };
  participants?: any[];
}

const Events = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { events, loading } = useEvent();
  const toast = useToast();

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'create') {
      navigate('/create');
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const categories = [
    { 
      id: 'create', 
      label: 'Create Event', 
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#1A472E]',
      icon: <img src="/create.png" alt="Create Event" className="w-12 h-12" />
    },
    { 
      id: 'all', 
      label: 'All Events', 
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#2A1F0E]',
      icon: <img src="/bantahblue.svg" alt="Create Event" className="w-10 h-10" />
    },
    { 
      id: 'pop culture', 
      label: 'Pop Culture', 
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#2A1F0E]',
      icon: <img src="/popcorn.svg" alt="Create Event" className="w-11 h-11" />
    },
    { 
      id: 'sports', 
      label: 'Sports', 
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#2A1215]',
      icon: <img src="/footballicon.png" alt="Create Event" className="w-12 h-12" />
    },
    { 
      id: 'music', 
      label: 'Music', 
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#1F1435]',
      icon: <img src="/dj setup.png" alt="Create Event" className="w-12 h-12" />
    },
    { 
      id: 'gaming', 
      label: 'Gaming', 
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#1A472E]',
      icon: <img src="/22gamepad.svg" alt="Create Event" className="w-12 h-12" />
    },
    { 
      id: 'crypto', 
      label: 'Crypto', 
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#FFA620FF]',
      icon: <img src="/bitcoin.svg" alt="Create Event" className="w-12 h-12" />
    },
    { 
      id: 'politics', 
      label: 'Politics', 
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-light-bg',
      icon: <img src="/politics.png" alt="Create Event" className="w-9 h-10" />
    }
  ];

  const filteredEvents = events.filter(event => 
    selectedCategory === 'all' ? true : event.category.toLowerCase() === selectedCategory
  );

  const handleChatClick = (event: Event) => {
    console.log('Opening chat for event:', event); // Debug log
    setSelectedEvent(event);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-[#1a1b2e]">
      <Header title="Events" icon={<Gamepad2 className="w-6 h-6" />} showSearch />
      
      {/* Category Bar */}
      <div className="sticky top-16 bg-light-bg z-40 py-2.5">
        <div className="container mx-auto px-4">
          <div className="flex md:justify-center overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/20 gap-3">
            <div className="flex gap-3 md:max-w-[800px]"> {/* Added wrapper div with max-width */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="flex-shrink-0 flex flex-col items-center relative pt-1"
                >
                  <div className="relative">
                    {/* Gradient outline container */}
                    <div className={`w-16 h-16 rounded-full relative
                      ${selectedCategory === category.id ? 'opacity-100' : 'opacity-100'}
                      transition-all duration-300`}
                    >
                      {/* Gradient border */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${category.gradient}`} />
                      
                      {/* Inner circle with icon */}
                      <div className={`absolute inset-[2px] rounded-full 
                        flex items-center justify-center
                        bg-light-bg
                        ${selectedCategory === category.id ? 'scale-105' : 'scale-100'}
                        transition-all duration-300`}
                      >
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                    </div>

                    {/* Category Label Badge */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 z-10">
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-sans font-medium whitespace-nowrap
                        bg-white
                        ${selectedCategory === category.id ? 'text-black' : 'text-black/60'}
                        transition-all duration-300`}
                      >
                        {category.label}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onJoin={() => handleChatClick(event)}
              onChatClick={() => handleChatClick(event)}
            />
          ))}
        </div>

        {/* Chat Overlay */}
        {showChat && selectedEvent && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="w-full h-full md:w-3/4 md:h-3/4 bg-[#242538] rounded-lg overflow-hidden">
              <EventChat
                event={selectedEvent}
                onClose={() => setShowChat(false)}
              />
            </div>
          </div>
        )}
      </div>

      <MobileFooterNav />
    </div>
  );
};

export default Events;
