-- First, verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'challenges';

-- If needed, add or modify the column
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS required_evidence text 
CHECK (required_evidence IN ('SCREENSHOT', 'VIDEO', 'BOTH'));

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
