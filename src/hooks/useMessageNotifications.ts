import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export const useMessageNotifications = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState({
    unreadMessages: 0,
    pendingFriendRequests: 0
  });

  useEffect(() => {
    if (!currentUser) return;

    // Initial fetch
    fetchNotificationCounts();

    // Set up real-time subscription for new messages
    const messagesChannel = supabase
      .channel('private-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        (payload) => {
          fetchNotificationCounts();
          // Show toast notification
          toast.showInfo('New message received');
        }
      )
      .subscribe();

    // Set up subscription for friend requests
    const friendRequestsChannel = supabase
      .channel('friend-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${currentUser.id}`
        },
        () => {
          fetchNotificationCounts();
          toast.showInfo('New friend request received');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(friendRequestsChannel);
    };
  }, [currentUser, toast]);

  const fetchNotificationCounts = async () => {
    if (!currentUser) return;

    try {
      const [messagesResponse, requestsResponse] = await Promise.all([
        supabase
          .from('private_messages')
          .select('id', { count: 'exact' })
          .eq('receiver_id', currentUser.id)
          .eq('read', false),
        
        supabase
          .from('friend_requests')
          .select('id', { count: 'exact' })
          .eq('receiver_id', currentUser.id)
          .eq('status', 'pending')
      ]);

      if (!messagesResponse.error && !requestsResponse.error) {
        setNotifications({
          unreadMessages: messagesResponse.count || 0,
          pendingFriendRequests: requestsResponse.count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  return notifications;
};
