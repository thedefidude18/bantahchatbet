-- Add status to event_participants
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'completed', 'cancelled', 'disputed'));

-- Add result tracking
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS result TEXT
CHECK (result IN ('won', 'lost', 'draw', null));

-- Add settlement tracking
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS settlement_amount INTEGER;

-- Create function to handle bet settlement
CREATE OR REPLACE FUNCTION settle_bet(
  match_id UUID,
  winning_prediction BOOLEAN
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update bet_matches status
  UPDATE bet_matches
  SET status = 'completed',
      winning_prediction = winning_prediction,
      updated_at = NOW()
  WHERE id = match_id;

  -- Update participants and handle payouts
  WITH match_data AS (
    SELECT * FROM bet_matches WHERE id = match_id
  )
  UPDATE event_participants ep
  SET status = 'completed',
      result = CASE 
        WHEN prediction = winning_prediction THEN 'won'
        ELSE 'lost'
      END,
      settled_at = NOW(),
      settlement_amount = CASE 
        WHEN prediction = winning_prediction THEN wager_amount * 2
        ELSE 0
      END
  FROM match_data md
  WHERE ep.id IN (md.yes_participant_id, md.no_participant_id);
END;
$$;