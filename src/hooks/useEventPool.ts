import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useEventPool = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updatePoolAmount = useCallback(async (
    eventId: string, 
    amount: number, 
    prediction: boolean
  ) => {
    setIsLoading(true);
    try {
      const { data: pool, error: fetchError } = await supabase
        .from('event_pools')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (fetchError) throw fetchError;

      const adminFeePercentage = 0.03; // 3% admin fee (corrected from 5%)
      const adminFee = amount * adminFeePercentage;
      const netAmount = amount - adminFee;

      const { error: updateError } = await supabase
        .from('event_pools')
        .update({
          total_amount: pool.total_amount + amount,
          admin_fee: pool.admin_fee + adminFee,
          [prediction ? 'winning_pool' : 'losing_pool']: (prediction ? pool.winning_pool : pool.losing_pool) + netAmount
        })
        .eq('event_id', eventId);

      if (updateError) throw updateError;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    updatePoolAmount
  };
};
