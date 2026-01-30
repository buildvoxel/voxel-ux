-- Create iteration history table for tracking variant refinements
-- Each iteration stores the prompt, before/after HTML, and metadata

CREATE TABLE IF NOT EXISTS vibe_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES vibe_variants(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES vibe_sessions(id) ON DELETE CASCADE,
  variant_index INTEGER NOT NULL,
  iteration_number INTEGER NOT NULL DEFAULT 1,
  prompt TEXT NOT NULL,
  html_before TEXT NOT NULL,
  html_after TEXT NOT NULL,
  generation_model TEXT,
  generation_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure iteration numbers are unique per variant
  UNIQUE(variant_id, iteration_number)
);

-- Add iteration count to variants table
ALTER TABLE vibe_variants
ADD COLUMN IF NOT EXISTS iteration_count INTEGER DEFAULT 0;

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_vibe_iterations_variant_id ON vibe_iterations(variant_id);
CREATE INDEX IF NOT EXISTS idx_vibe_iterations_session_id ON vibe_iterations(session_id);

-- Enable RLS
ALTER TABLE vibe_iterations ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only see/modify their own iterations
CREATE POLICY "Users can view own iterations" ON vibe_iterations
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM vibe_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own iterations" ON vibe_iterations
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM vibe_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own iterations" ON vibe_iterations
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM vibe_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own iterations" ON vibe_iterations
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM vibe_sessions WHERE user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON TABLE vibe_iterations IS 'History of variant iterations/refinements';
COMMENT ON COLUMN vibe_iterations.prompt IS 'User prompt for this iteration';
COMMENT ON COLUMN vibe_iterations.html_before IS 'HTML before this iteration';
COMMENT ON COLUMN vibe_iterations.html_after IS 'HTML after this iteration';
COMMENT ON COLUMN vibe_iterations.iteration_number IS 'Sequential number of this iteration for the variant';
