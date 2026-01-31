-- Add partial_html column to save streaming HTML during generation
-- This allows resuming or displaying progress after page refresh

ALTER TABLE vibe_variants ADD COLUMN IF NOT EXISTS partial_html TEXT;
ALTER TABLE vibe_variants ADD COLUMN IF NOT EXISTS partial_html_updated_at TIMESTAMPTZ;

-- Clear partial_html when variant is complete (cleanup)
CREATE OR REPLACE FUNCTION clear_partial_html_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'complete' AND OLD.status != 'complete' THEN
    NEW.partial_html := NULL;
    NEW.partial_html_updated_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clear_partial_html
  BEFORE UPDATE ON vibe_variants
  FOR EACH ROW
  EXECUTE FUNCTION clear_partial_html_on_complete();

-- Add index for querying incomplete variants with partial HTML
CREATE INDEX IF NOT EXISTS idx_vibe_variants_partial_html
ON vibe_variants(session_id, status)
WHERE partial_html IS NOT NULL;

COMMENT ON COLUMN vibe_variants.partial_html IS 'Streaming HTML saved during generation for resumption/preview';
COMMENT ON COLUMN vibe_variants.partial_html_updated_at IS 'Last time partial HTML was updated during streaming';
