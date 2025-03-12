import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function useNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const toast = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      
      // Add error handling and retry logic
      let retries = 3;
      let error;
      
      while (retries > 0) {
        try {
          const { data, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

          if (fetchError) throw fetchError;
          
          setNotifications(data || []);
          return; // Success, exit the retry loop
        } catch (e) {
          error = e;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          }
        }
      }
      
      // If we get here, all retries failed
      throw error;

    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      toast.showError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    refetchNotifications: fetchNotifications
  };
}
