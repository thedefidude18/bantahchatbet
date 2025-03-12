import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';

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
  const { notifications, loading, markAsRead, markAllAsRead } = useNotification();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const filterNotifications = React.useMemo(() => {
      console.log(`Filtering ${notifications.length} notifications for ${filter} filter`);
      
      return notifications.filter(notification => {
        const { notification_type, metadata } = notification;
        
        if (filter === 'all') return true;
        
        const filterConfig = filters.find(f => f.id === filter);
        if (!filterConfig) return false;
        
        if (notification_type === 'system') {
          return filter === 'system' || metadata?.category === filter;
        }
        
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
  // Remove the separate filteredNotifications variable and use the memoized result directly
  return (
    <div className="min-h-screen bg-[#1a1b2e] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h1>
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-[#CCFF00] text-black rounded-lg"
          >
            Mark all as read
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          {filters.map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-lg ${
                filter === filterOption.id
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-[#242538] text-white'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-[#242538] rounded-lg p-6 text-center text-white">
              <LoadingSpinner />
              <p className="mt-2">Loading notifications...</p>
            </div>
          ) : filterNotifications.length === 0 ? (
            <div className="bg-[#242538] rounded-lg p-6 text-center text-white">
              <p className="text-lg mb-2">No notifications found</p>
              <p className="text-sm text-gray-400">
                {filter === 'all' 
                  ? "You don't have any notifications yet"
                  : `No ${filter} notifications found`}
              </p>
            </div>
          ) : (
            filterNotifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-[#242538] rounded-lg p-4 ${
                  !notification.read_at ? 'border-l-4 border-[#CCFF00]' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="text-white">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-gray-400">{notification.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="px-3 py-1 bg-[#CCFF00] text-black rounded"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
