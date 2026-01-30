-- Migration: Add visual wireframe support
-- Date: 2026-02-02

-- Add wireframe URL and path columns to vibe_variant_plans
ALTER TABLE vibe_variant_plans
ADD COLUMN IF NOT EXISTS wireframe_url TEXT,
ADD COLUMN IF NOT EXISTS wireframe_path TEXT;

-- Add comment for documentation
COMMENT ON COLUMN vibe_variant_plans.wireframe_url IS 'Public URL of the visual wireframe HTML file';
COMMENT ON COLUMN vibe_variant_plans.wireframe_path IS 'Storage path of the visual wireframe HTML file';

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_vibe_variant_plans_wireframe_url
ON vibe_variant_plans(session_id)
WHERE wireframe_url IS NOT NULL;
