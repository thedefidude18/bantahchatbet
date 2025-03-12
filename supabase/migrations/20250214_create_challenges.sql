-- Create challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_id UUID REFERENCES users(id),
    challenged_id UUID REFERENCES users(id),
    amount DECIMAL NOT NULL,
    game_type VARCHAR NOT NULL,
    platform VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    game_details JSONB DEFAULT '{}'::jsonb
);

-- Add indexes
CREATE INDEX IF NOT EXISTS challenges_challenger_id_idx ON challenges(challenger_id);
CREATE INDEX IF NOT EXISTS challenges_challenged_id_idx ON challenges(challenged_id);
CREATE INDEX IF NOT EXISTS challenges_status_idx ON challenges(status);

-- Add RLS policies
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Policy for viewing challenges
CREATE POLICY "Users can view their own challenges"
ON challenges FOR SELECT
TO authenticated
USING (
    challenger_id = auth.uid() OR
    challenged_id = auth.uid() OR
    status = 'completed'
);

-- Policy for creating challenges
CREATE POLICY "Users can create challenges"
ON challenges FOR INSERT
TO authenticated
WITH CHECK (
    challenger_id = auth.uid() AND
    status = 'pending'
);

-- Policy for updating challenges
CREATE POLICY "Users can update their own challenges"
ON challenges FOR UPDATE
TO authenticated
USING (
    challenger_id = auth.uid() OR
    challenged_id = auth.uid()
)
WITH CHECK (
    challenger_id = auth.uid() OR
    challenged_id = auth.uid()
);

-- Insert some sample data
INSERT INTO challenges (
    challenger_id,
    challenged_id,
    amount,
    game_type,
    platform,
    status,
    expires_at
) VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        1000,
        'FIFA 24',
        'PlayStation 5',
        'pending',
        NOW() + INTERVAL '24 hours'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        2000,
        'Call of Duty',
        'Xbox Series X',
        'accepted',
        NOW() + INTERVAL '48 hours'
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        1500,
        'NBA 2K24',
        'PlayStation 5',
        'completed',
        NOW() + INTERVAL '12 hours'
    )
ON CONFLICT DO NOTHING;