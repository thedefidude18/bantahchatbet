import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  banner_url: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  pool: {
    total_amount: number;
  };
  creator: {
    id: string;
    username: string;
  };
  participants: Array<{
    prediction: boolean;
    user_id: string;
  }>;
}

interface CreateEventData {
  title: string;
  description: string;
  category: string;
  start_time: Date;
  end_time: Date;
  wager_amount: number;
  max_participants: number;
  banner_url: string;
  is_private: boolean;
  rules: string;
}

export function useEvent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { currentUser } = useAuth();

  const fetchEvents = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`
          *,
          creator:creator_id (
            id,
            username
          ),
          pool:event_pools (*),
          participants:event_participants (
            user_id,
            prediction
          ),
          banner_url
        `)
        .order('created_at', { ascending: false });
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.showError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const joinEvent = useCallback(async (eventId: string, prediction: boolean) => {
    try {
      setLoading(true);
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!currentUser) {
        throw new Error('User must be logged in to join event');
      }

      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: currentUser.id,
          prediction: prediction
        });

      if (error) throw error;

      // Notify creator about new participant
      await supabase
        .from('notifications')
        .insert({
          user_id: event.creator_id,
          type: 'event_participation',
          title: 'New Event Participant',
          content: `${currentUser?.name || 'Someone'} joined your event: ${event.title}`,
          metadata: {
            event_id: eventId,
            participant_id: currentUser.id,
            prediction: prediction
          }
        });

      // Check for milestones
      const { count } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId);

      const milestones = [10, 50, 100];
      if (milestones.includes(count)) {
        await supabase
          .from('notifications')
          .insert({
            user_id: event.creator_id,
            type: 'event_milestone',
            title: 'Event Milestone Reached! 🎉',
            content: `Your event "${event.title}" has reached ${count} participants!`,
            metadata: {
              event_id: eventId,
              participant_count: count
            }
          });
      }
      
      await fetchEvents();
      toast.showSuccess('Successfully joined event');
    } catch (error) {
      console.error('Error joining event:', error);
      toast.showError('Failed to join event');
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, toast, currentUser]);

  const createEvent = async (eventData: CreateEventData) => {
    if (!currentUser) {
      throw new Error('User must be logged in to create an event');
    }

    try {
      // Format the data properly
      const eventPayload = {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        start_time: new Date(eventData.start_time).toISOString(),
        end_time: new Date(eventData.end_time).toISOString(),
        wager_amount: eventData.wager_amount,
        max_participants: eventData.max_participants,
        banner_url: eventData.banner_url,
        is_private: eventData.is_private,
        rules: eventData.rules,
        creator_id: currentUser.id,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventPayload])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Broadcast notification to all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      if (users && users.length > 0) {
        const notifications = users.map(user => ({
          user_id: user.id,
          type: 'event_created',
          title: 'New Event Created',
          content: `@${currentUser.username} just created a new event - ${eventData.title}`,
          metadata: {
            event_id: data.id,
            banner_url: eventData.banner_url,
          },
        }));

        const { error: notificationsError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationsError) {
          console.error('Error inserting notifications:', notificationsError);
          throw notificationsError;
        }
      }

      await fetchEvents();
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    createEvent,
    joinEvent,
    fetchEvents
  };
}
