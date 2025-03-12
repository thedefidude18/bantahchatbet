import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface JoinRequest {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  response_message?: string;
  created_at: string;
}

export function useEventJoinRequest() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();
  const toast = useToast();

  const requestToJoin = useCallback(async (
    eventId: string,
    message?: string
  ) => {
    if (!currentUser) {
      toast.showError('You must be logged in to join events');
      return false;
    }

    setIsProcessing(true);

    try {
      // Check if already requested
      const { data: existingRequest, error: checkError } = await supabase
        .from('event_join_requests')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          toast.showInfo('Join request already pending');
          return false;
        }
        if (existingRequest.status === 'accepted') {
          toast.showInfo('You are already a member of this event');
          return false;
        }
      }

      // Get event details for notification
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('title, creator_id')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Create new request
      const { error: insertError } = await supabase
        .from('event_join_requests')
        .insert({
          event_id: eventId,
          user_id: currentUser.id,
          message: message || null,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Create notification for event creator
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: event.creator_id,
          notification_type: 'join_request_received', // Changed from 'type' to 'notification_type'
          title: 'New Join Request',
          content: `${currentUser.username || 'A user'} has requested to join your event: ${event.title}`,
          metadata: {
            event_id: eventId,
            event_title: event.title,
            requester_id: currentUser.id,
            requester_name: currentUser.username,
            request_message: message
          }
        });

      if (notificationError) throw notificationError;

      toast.showSuccess('Join request sent successfully');
      return true;

    } catch (error: any) {
      console.error('Error requesting to join:', error);
      toast.showError(error.message || 'Failed to send join request');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, toast]);

  const getPendingRequests = useCallback(async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_join_requests')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching pending requests:', error);
      toast.showError(error.message || 'Failed to fetch pending requests');
      return [];
    }
  }, [toast]);

  const respondToRequest = useCallback(async (
    requestId: string,
    status: 'accepted' | 'declined',
    responseMessage?: string
  ) => {
    setIsProcessing(true);

    try {
      // Get request details first
      const { data: request, error: requestError } = await supabase
        .from('event_join_requests')
        .select(`
          *,
          events (
            title,
            creator_id
          )
        `)
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Update request status
      const { error: updateError } = await supabase
        .from('event_join_requests')
        .update({
          status,
          response_message: responseMessage || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create notification for requester
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.user_id,
          notification_type: `event_join_request_${status}`,
          title: `Join Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          content: status === 'accepted' 
            ? `Your request to join "${request.events.title}" has been accepted`
            : `Your request to join "${request.events.title}" has been declined${responseMessage ? `: ${responseMessage}` : ''}`,
          metadata: {
            event_id: request.event_id,
            event_title: request.events.title,
            response_message: responseMessage
          }
        });

      if (notificationError) throw notificationError;

      toast.showSuccess(`Request ${status} successfully`);
      return true;
    } catch (error: any) {
      console.error('Error responding to request:', error);
      toast.showError(error.message || 'Failed to process request');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    requestToJoin,
    getPendingRequests,
    respondToRequest,
    isProcessing
  };
}
