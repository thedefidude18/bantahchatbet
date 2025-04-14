import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import PageHeader from '../components/PageHeader';
import MobileFooterNav from '../components/MobileFooterNav';

const filters = [
  { id: 'all', label: 'All Notifications', types: [] },
  { 
    id: 'events', 
    label: 'Events', 
    types: [
      'event_win',
      'event_loss',
      'new_event',
      'event_update',
      'event_created',
      'event_participation',
      'event_joined',
      'event_milestone'
    ]
  },
  { 
    id: 'challenges', 
    label: 'Challenges', 
    types: [
      'challenge_received',
      'challenge_accepted',
      'challenge_declined',
      'challenge_completed',
      'challenge_winner',
      'challenge_loser',
      'challenge_expired'
    ]
  },
  { 
    id: 'messages', 
    label: 'Messages', 
    types: ['direct_message', 'group_message', 'group_mention'] 
  },
  { 
    id: 'system', 
    label: 'System', 
    types: ['system'] 
  }
];

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, refetchNotifications, markAsRead, markAllAsRead } = useNotification();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const filterNotifications = React.useMemo(() => {
    return notifications.filter(notification => {
      const { notification_type, metadata } = notification;
      
      if (filter === 'all') return true;
      
      const filterConfig = filters.find(f => f.id === filter);
      if (!filterConfig) return false;
      return filterConfig.types.includes(notification_type);
    });
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.showSuccess('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.showError('Failed to mark notifications as read');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast.showSuccess('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.showError('Failed to mark notification as read');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <PageHeader title="Notifications" />
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-4">
          {/* Compact Filter Bar */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1 overflow-x-auto">
            {filters.map(filterOption => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === filterOption.id
                    ? 'bg-[#CCFF00] text-black shadow'
                    : 'bg-transparent text-gray-700 hover:bg-gray-100'
                }`}
                style={{ minWidth: 0 }}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner />
                <p className="mt-4 text-gray-500 font-medium">Loading notifications...</p>
              </div>
            ) : filterNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <img src="/noti-lonely.svg" alt="No notifications" className="w-32 h-32 mb-4 opacity-80" />
                <p className="text-lg font-semibold text-gray-700 mb-1">No notifications found</p>
                <p className="text-sm text-gray-400">
                  {filter === 'all' 
                    ? "You don't have any notifications yet"
                    : `No ${filter} notifications found`}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filterNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`flex items-center bg-white rounded-2xl shadow-sm px-4 py-3 transition border border-transparent hover:border-[#CCFF00]/40 relative group ${!notification.read_at ? 'ring-2 ring-[#CCFF00]/40' : ''}`}
                  >
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#F6F7FB] flex items-center justify-center mr-4">
                      {notification.metadata?.banner_url ? (
                        <img src={notification.metadata.banner_url} alt="Banner" className="w-10 h-10 object-cover rounded-full" />
                      ) : (
                        <Bell className="w-6 h-6 text-[#CCFF00]" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-gray-900 truncate ${!notification.read_at ? 'font-bold' : ''}`}>{notification.title}</span>
                        {!notification.read_at && <span className="w-2 h-2 bg-[#CCFF00] rounded-full inline-block" />}
                      </div>
                      <p className="text-gray-500 text-sm truncate">{notification.content}</p>
                      {/* Challenge Accept/Decline Buttons */}
                      {notification.notification_type && notification.notification_type.startsWith('challenge_') && !notification.read_at && (
                        <div className="flex gap-2 mt-2">
                          <button
                            className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-xs font-semibold shadow hover:bg-[#b3ff00] transition"
                            onClick={() => {/* Accept logic here (handled elsewhere) */}}
                          >
                            Accept
                          </button>
                          <button
                            className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold shadow hover:bg-red-200 transition"
                            onClick={() => {/* Decline logic here (handled elsewhere) */}}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Time & Actions */}
                    <div className="flex flex-col items-end ml-4 gap-2 min-w-[80px]">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!notification.read_at && !notification.notification_type?.startsWith('challenge_') && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs px-3 py-1 rounded-full bg-[#CCFF00] text-black font-medium shadow hover:bg-[#b3ff00] transition"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Floating Mark All as Read Button */}
        <button
          onClick={handleMarkAllRead}
          className="fixed bottom-6 right-6 z-50 bg-[#CCFF00] text-black rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-[#b3ff00] transition"
          title="Mark all as read"
        >
          <Bell className="w-7 h-7" />
        </button>
      </div>
      <MobileFooterNav />
    </div>
  );
};

export default Notifications;
