-- Migration: Add understanding phase and variant selection
-- Date: 2026-02-01

-- Add understanding fields to vibe_sessions
ALTER TABLE vibe_sessions
ADD COLUMN IF NOT EXISTS llm_understanding TEXT,
ADD COLUMN IF NOT EXISTS understanding_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS understanding_approved_at TIMESTAMPTZ;

-- Add selection field to vibe_variant_plans
ALTER TABLE vibe_variant_plans
ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT true;

-- Update status enum comment (for documentation)
COMMENT ON COLUMN vibe_sessions.status IS
'Status flow: idle → analyzing → understanding → understanding_ready → planning → plan_ready → wireframing → wireframe_ready → generating → complete | failed';

-- Create index for faster lookups on selected variants
CREATE INDEX IF NOT EXISTS idx_vibe_variant_plans_selected
ON vibe_variant_plans(session_id, is_selected)
WHERE is_selected = true;

-- Add sharing tables
CREATE TABLE IF NOT EXISTS vibe_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES vibe_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL CHECK (share_type IN ('specific', 'random')),
  variant_index INTEGER, -- NULL for random type
  share_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL means never expires
  CONSTRAINT valid_specific_share CHECK (
    share_type != 'specific' OR variant_index IS NOT NULL
  )
);

-- Track views for analytics
CREATE TABLE IF NOT EXISTS vibe_share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES vibe_shares(id) ON DELETE CASCADE,
  variant_index INTEGER NOT NULL,
  viewer_ip_hash TEXT, -- Hashed for privacy
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for share lookups
CREATE INDEX IF NOT EXISTS idx_vibe_shares_token ON vibe_shares(share_token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_vibe_shares_session ON vibe_shares(session_id);
CREATE INDEX IF NOT EXISTS idx_vibe_share_views_share ON vibe_share_views(share_id);

-- RLS policies for vibe_shares
ALTER TABLE vibe_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shares"
  ON vibe_shares
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active shares by token"
  ON vibe_shares
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS policies for vibe_share_views
ALTER TABLE vibe_share_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Share owners can view analytics"
  ON vibe_share_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vibe_shares
      WHERE vibe_shares.id = vibe_share_views.share_id
      AND vibe_shares.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert views"
  ON vibe_share_views
  FOR INSERT
  WITH CHECK (true);

-- Function to generate short share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create a share link
CREATE OR REPLACE FUNCTION create_share_link(
  p_session_id UUID,
  p_share_type TEXT,
  p_variant_index INTEGER DEFAULT NULL,
  p_expires_in_days INTEGER DEFAULT NULL
)
RETURNS TABLE(share_id UUID, share_token TEXT) AS $$
DECLARE
  v_token TEXT;
  v_share_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Generate unique token
  LOOP
    v_token := generate_share_token();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM vibe_shares WHERE vibe_shares.share_token = v_token);
  END LOOP;

  -- Calculate expiration
  IF p_expires_in_days IS NOT NULL THEN
    v_expires_at := now() + (p_expires_in_days || ' days')::interval;
  END IF;

  -- Insert share
  INSERT INTO vibe_shares (session_id, user_id, share_type, variant_index, share_token, expires_at)
  VALUES (p_session_id, auth.uid(), p_share_type, p_variant_index, v_token, v_expires_at)
  RETURNING id INTO v_share_id;

  RETURN QUERY SELECT v_share_id, v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get share data (for public viewing)
CREATE OR REPLACE FUNCTION get_share_data(p_token TEXT)
RETURNS JSON AS $$
DECLARE
  v_share vibe_shares%ROWTYPE;
  v_session vibe_sessions%ROWTYPE;
  v_variant_index INTEGER;
  v_variant vibe_variants%ROWTYPE;
  v_plan vibe_variant_plans%ROWTYPE;
BEGIN
  -- Get share
  SELECT * INTO v_share FROM vibe_shares
  WHERE share_token = p_token
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now());

  IF v_share IS NULL THEN
    RETURN json_build_object('error', 'Share not found or expired');
  END IF;

  -- Get session
  SELECT * INTO v_session FROM vibe_sessions WHERE id = v_share.session_id;

  -- Determine variant index
  IF v_share.share_type = 'random' THEN
    -- Pick random from selected variants
    SELECT variant_index INTO v_variant_index
    FROM vibe_variant_plans
    WHERE session_id = v_share.session_id AND is_selected = true
    ORDER BY random()
    LIMIT 1;
  ELSE
    v_variant_index := v_share.variant_index;
  END IF;

  -- Get variant and plan
  SELECT * INTO v_variant FROM vibe_variants
  WHERE session_id = v_share.session_id AND variant_index = v_variant_index;

  SELECT * INTO v_plan FROM vibe_variant_plans
  WHERE session_id = v_share.session_id AND variant_index = v_variant_index;

  -- Increment view count
  UPDATE vibe_shares SET view_count = view_count + 1 WHERE id = v_share.id;

  RETURN json_build_object(
    'share', json_build_object(
      'id', v_share.id,
      'type', v_share.share_type,
      'created_at', v_share.created_at
    ),
    'session', json_build_object(
      'id', v_session.id,
      'name', v_session.name,
      'prompt', v_session.prompt
    ),
    'variant', json_build_object(
      'index', v_variant_index,
      'html_url', v_variant.html_url,
      'title', v_plan.title,
      'description', v_plan.description
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
