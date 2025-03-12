import { useSupabase } from '../lib/supabase';

interface JoinEventData {
  eventId: string;
  userId: string;
  prediction: boolean;
  wagerAmount: number;
}

export const useEventParticipation = () => {
  const { supabase } = useSupabase();
  
  const joinEvent = async (data: JoinEventData) => {
    const { error } = await supabase
      .from('event_participants')
      .insert({
        event_id: data.eventId,
        user_id: data.userId,
        prediction: data.prediction,
        wager_amount: data.wagerAmount
      });

    if (error) throw error;
  };

  return { joinEvent };
};
