-- Add edit operations columns to vibe_variant_plans
-- These store the find/replace operations used to generate variants

ALTER TABLE vibe_variant_plans
ADD COLUMN IF NOT EXISTS edit_operations JSONB,
ADD COLUMN IF NOT EXISTS edit_summary TEXT;

-- Add index for querying plans with edits
CREATE INDEX IF NOT EXISTS idx_variant_plans_edit_operations
ON vibe_variant_plans (session_id)
WHERE edit_operations IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN vibe_variant_plans.edit_operations IS 'Array of {find, replace, description} edit operations';
COMMENT ON COLUMN vibe_variant_plans.edit_summary IS 'Brief summary of what the edits accomplish';
