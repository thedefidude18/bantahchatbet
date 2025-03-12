-- Create trigger function for payment notifications
CREATE OR REPLACE FUNCTION handle_payment_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- For new payments
  IF (TG_OP = 'INSERT') THEN
    -- Create notification for payment initiation
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      metadata
    )
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.type = 'deposit' THEN 'deposit_initiated'::notification_type
        WHEN NEW.type = 'withdrawal' THEN 'withdrawal_initiated'::notification_type
        WHEN NEW.type = 'transfer' THEN 'transfer_initiated'::notification_type
      END,
      CASE 
        WHEN NEW.type = 'deposit' THEN 'Deposit Initiated'
        WHEN NEW.type = 'withdrawal' THEN 'Withdrawal Initiated'
        WHEN NEW.type = 'transfer' THEN 'Transfer Initiated'
      END,
      CASE 
        WHEN NEW.type = 'deposit' THEN format('Processing deposit of ₦%s', NEW.amount)
        WHEN NEW.type = 'withdrawal' THEN format('Processing withdrawal of ₦%s', NEW.amount)
        WHEN NEW.type = 'transfer' THEN format('Processing transfer of ₦%s', NEW.amount)
      END,
      jsonb_build_object(
        'transaction_id', NEW.id,
        'amount', NEW.amount,
        'type', NEW.type,
        'status', NEW.status
      )
    );
  
  -- For updated payments
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Only create notification if status has changed
    IF NEW.status != OLD.status THEN
      INSERT INTO notifications (
        user_id,
        type,
        title,
        content,
        metadata
      )
      VALUES (
        NEW.user_id,
        CASE 
          WHEN NEW.status = 'completed' AND NEW.type = 'deposit' THEN 'deposit_success'::notification_type
          WHEN NEW.status = 'completed' AND NEW.type = 'withdrawal' THEN 'withdrawal_success'::notification_type
          WHEN NEW.status = 'completed' AND NEW.type = 'transfer' THEN 'transfer_success'::notification_type
          WHEN NEW.status = 'failed' AND NEW.type = 'deposit' THEN 'deposit_failed'::notification_type
          WHEN NEW.status = 'failed' AND NEW.type = 'withdrawal' THEN 'withdrawal_failed'::notification_type
          WHEN NEW.status = 'failed' AND NEW.type = 'transfer' THEN 'transfer_failed'::notification_type
        END,
        CASE 
          WHEN NEW.status = 'completed' AND NEW.type = 'deposit' THEN 'Deposit Successful'
          WHEN NEW.status = 'completed' AND NEW.type = 'withdrawal' THEN 'Withdrawal Successful'
          WHEN NEW.status = 'completed' AND NEW.type = 'transfer' THEN 'Transfer Successful'
          WHEN NEW.status = 'failed' AND NEW.type = 'deposit' THEN 'Deposit Failed'
          WHEN NEW.status = 'failed' AND NEW.type = 'withdrawal' THEN 'Withdrawal Failed'
          WHEN NEW.status = 'failed' AND NEW.type = 'transfer' THEN 'Transfer Failed'
        END,
        CASE 
          WHEN NEW.status = 'completed' AND NEW.type = 'deposit' THEN format('Your wallet has been credited with ₦%s', NEW.amount)
          WHEN NEW.status = 'completed' AND NEW.type = 'withdrawal' THEN format('Your withdrawal of ₦%s has been processed', NEW.amount)
          WHEN NEW.status = 'completed' AND NEW.type = 'transfer' THEN format('Your transfer of ₦%s has been completed', NEW.amount)
          WHEN NEW.status = 'failed' THEN format('Transaction failed. Please try again or contact support.')
        END,
        jsonb_build_object(
          'transaction_id', NEW.id,
          'amount', NEW.amount,
          'type', NEW.type,
          'status', NEW.status,
          'error_message', NEW.error_message
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payments
DROP TRIGGER IF EXISTS on_payment_change ON transactions;
CREATE TRIGGER on_payment_change
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_changes();
