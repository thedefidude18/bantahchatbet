import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Star, Award, Users, ArrowLeft } from 'lucide-react';
import { useEventHistory } from '../hooks/useEventHistory';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EditEventModal from '../components/modals/EditEventModal';
import Header from '../components/Header';
import MobileFooterNav from '../components/MobileFooterNav';
import { supabase } from '../lib/supabase';

const tabs = [
  { id: 'created', label: 'Created Events', icon: Star },
  { id: 'joined', label: 'Participated', icon: Clock },
  { id: 'won', label: 'Won', icon: Trophy },
  { id: 'lost', label: 'Lost', icon: Award },
];

const MyEvents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('created');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { createdEvents, history: joinedEvents, loading } = useEventHistory();
  const { currentUser } = useAuth();

  const getFilteredEvents = () => {
    switch (activeTab) {
      case 'created':
        return createdEvents;
      case 'joined':
        return joinedEvents;
      case 'won':
        return joinedEvents.filter(event => 
          event.status === 'completed' && 
          event.participants?.some(p => 
            p.user_id === currentUser?.id && p.prediction === true
          )
        );
      case 'lost':
        return joinedEvents.filter(event => 
          event.status === 'completed' && 
          event.participants?.some(p => 
            p.user_id === currentUser?.id && p.prediction === false
          )
        );
      default:
        return [];
    }
  };

  const renderEventCard = (event: any) => (
    <div key={event.id} className="bg-[#242538] rounded-lg overflow-hidden">
      <div className="flex">
        {event.banner_url && (
          <div 
            className="relative w-32 h-24 cursor-pointer"
            onClick={() => navigate(`/chat/${event.id}`)}
          >
            <img 
              src={event.banner_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 
                  className="text-base font-semibold text-white truncate cursor-pointer hover:text-[#CCFF00]"
                  onClick={() => navigate(`/chat/${event.id}`)}
                >
                  {event.title}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  event.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#CCFF00] text-black'
                }`}>
                  {event.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-3 text-xs text-gray-400 mb-2">
                {activeTab !== 'created' && event.creator && (
                  <div 
                    className="flex items-center gap-1 cursor-pointer hover:text-[#CCFF00]"
                    onClick={() => navigate(`/chat/${event.id}`)}
                  >
                    <Users className="w-3 h-3" />
                    <span>By {event.creator.username}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(event.start_time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{event.participant_count?.count || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="bg-black/30 px-2 py-1 rounded">
                  <span className="text-[#CCFF00]">₦ {Number(event.pool?.total_amount || 0).toLocaleString()}</span> Pool
                </div>
                {event.status === 'completed' && (
                  <div className="bg-black/30 px-2 py-1 rounded">
                    <span className="text-[#CCFF00]">
                      ₦ {Number(event.user_earnings || 0).toLocaleString()}
                    </span>
                    {' '}
                    {event.user_earnings > 0 ? 'Won' : 'Lost'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => navigate(`/chat/${event.id}`)}
                className="px-2 py-1 bg-[#CCFF00] text-black rounded text-xs font-medium whitespace-nowrap"
              >
                Chat
              </button>
              {event.is_editable && event.status === 'active' && (
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsEditModalOpen(true);
                  }}
                  className="px-2 py-1 border border-[#CCFF00] text-white rounded text-xs font-medium whitespace-nowrap"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#1a1b2e]">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="ml-4 text-xl font-bold">My Events</h1>
            </div>
          </div>
        </header>

      
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-[#242538] text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredEvents().length === 0 ? (
              <div className="bg-[#242538] rounded-lg p-6 text-center text-white">
                <p className="text-lg mb-2">No events found</p>
                <p className="text-sm text-gray-400">
                  {activeTab === 'created' 
                    ? "You haven't created any events yet" 
                    : `No ${activeTab} events found`}
                </p>
              </div>
            ) : (
              getFilteredEvents().map(renderEventCard)
            )}
          </div>
        )}
        {selectedEvent && (
          <EditEventModal
            event={selectedEvent}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedEvent(null);
            }}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedEvent(null);
              fetchEvents();
            }}
          />
        )}
      </div>
      <MobileFooterNav />
    </>
  );
};

export default MyEvents;