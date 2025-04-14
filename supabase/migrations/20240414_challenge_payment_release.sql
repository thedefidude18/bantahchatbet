-- Create function to handle payment release
create or replace function public.release_challenge_payment(
  p_challenge_id uuid,
  p_admin_id uuid
)
returns void
security definer
set search_path = public
language plpgsql
as $$
declare
  v_winner_id uuid;
  v_total_amount numeric;
  v_platform_fee numeric;
  v_winner_payout numeric;
begin
  -- Get challenge details and validate
  select winner_id, amount * 2
  into v_winner_id, v_total_amount
  from challenges
  where id = p_challenge_id;

  if v_winner_id is null then
    raise exception 'No winner set for this challenge';
  end if;

  -- Calculate fees and payout
  v_platform_fee := v_total_amount * 0.05; -- 5% platform fee
  v_winner_payout := v_total_amount - v_platform_fee;

  -- Update user balance for the winner
  update users
  set balance = balance + v_winner_payout
  where id = v_winner_id;

  -- Update challenge status
  update challenges
  set 
    status = 'completed',
    payment_released = true,
    payment_released_at = now(),
    payment_released_by = p_admin_id
  where id = p_challenge_id;

  -- Insert transaction record
  insert into transactions (
    user_id,
    amount,
    type,
    status,
    reference,
    description
  ) values (
    v_winner_id,
    v_winner_payout,
    'challenge_win',
    'completed',
    p_challenge_id::text,
    'Challenge win payout'
  );
end;
$$;