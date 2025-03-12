CREATE TYPE notification_type AS ENUM (
  'payment_success',
  'payment_failed',
  'deposit_initiated',
  'withdrawal_initiated',
  'withdrawal_completed',
  'withdrawal_failed'
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_id UUID REFERENCES transactions(id),
  notification_type notification_type NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_transaction_id ON notifications(transaction_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    reference TEXT UNIQUE,
    payment_provider TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    metadata JSONB,
    
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create a trigger function for notifications
CREATE OR REPLACE FUNCTION create_transaction_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'deposit' THEN
        IF NEW.status = 'pending' THEN
            INSERT INTO notifications (
                user_id,
                transaction_id,
                notification_type,
                message
            ) VALUES (
                NEW.user_id,
                NEW.id,
                'deposit_initiated',
                'Your deposit has been initiated'
            );
        ELSIF NEW.status = 'completed' THEN
            INSERT INTO notifications (
                user_id,
                transaction_id,
                notification_type,
                message
            ) VALUES (
                NEW.user_id,
                NEW.id,
                'payment_success',
                'Your deposit of ₦' || NEW.amount::text || ' has been completed'
            );
        ELSIF NEW.status = 'failed' THEN
            INSERT INTO notifications (
                user_id,
                transaction_id,
                notification_type,
                message
            ) VALUES (
                NEW.user_id,
                NEW.id,
                'payment_failed',
                'Your deposit transaction has failed'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER transaction_notification_trigger
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION create_transaction_notification();

-- Create indices for faster queries
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_reference ON transactions(reference);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
