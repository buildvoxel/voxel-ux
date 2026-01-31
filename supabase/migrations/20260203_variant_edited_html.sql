-- Add edited_html column to vibe_variants for storing user edits
-- This is the "working copy" - separate from iteration history

ALTER TABLE vibe_variants
ADD COLUMN IF NOT EXISTS edited_html TEXT,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Comment for documentation
COMMENT ON COLUMN vibe_variants.edited_html IS 'User-edited HTML content (working copy)';
COMMENT ON COLUMN vibe_variants.edited_at IS 'Timestamp of last edit';
