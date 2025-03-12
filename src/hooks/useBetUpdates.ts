import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

export function useBetUpdates(participantId: string) {
  const [matchStatus, setMatchStatus] = useState<'waiting' | 'matched' | 'completed'>('waiting');
  const toast = useToast();

  useEffect(() => {
    const subscription = supabase
      .channel(`bet_updates:${participantId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bet_matches',
        filter: `yes_participant_id=eq.${participantId},no_participant_id=eq.${participantId}`
      }, (payload) => {
        const newStatus = payload.new.status;
        setMatchStatus(newStatus);
        
        if (newStatus === 'matched') {
          toast.showSuccess('Your bet has been matched!');
        } else if (newStatus === 'completed') {
          toast.showSuccess('Bet has been settled!');
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [participantId]);

  return matchStatus;
}