-- Voxel UX Demo Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Screens: Captured HTML screens
CREATE TABLE IF NOT EXISTS screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  html TEXT,
  thumbnail TEXT,
  source TEXT,
  tags TEXT[],
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screen Versions: Version history for screens
CREATE TABLE IF NOT EXISTS screen_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  html TEXT NOT NULL,
  prompt TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Screen UI Metadata: Extracted UI analysis
CREATE TABLE IF NOT EXISTS screen_ui_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE UNIQUE,
  colors JSONB,
  typography JSONB,
  layout JSONB,
  components JSONB,
  accessibility JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibe Sessions: AI vibe coding sessions
CREATE TABLE IF NOT EXISTS vibe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'planning', 'planned', 'generating', 'complete', 'failed')),
  selected_variant_index INTEGER,
  model TEXT,
  provider TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibe Variant Plans: AI-generated variant plans
CREATE TABLE IF NOT EXISTS vibe_variant_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES vibe_sessions(id) ON DELETE CASCADE,
  variant_index INTEGER NOT NULL CHECK (variant_index BETWEEN 1 AND 4),
  title TEXT NOT NULL,
  description TEXT,
  key_changes TEXT[],
  style_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, variant_index)
);

-- Vibe Variants: Generated variant code
CREATE TABLE IF NOT EXISTS vibe_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES vibe_sessions(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES vibe_variant_plans(id) ON DELETE CASCADE,
  variant_index INTEGER NOT NULL CHECK (variant_index BETWEEN 1 AND 4),
  html TEXT,
  html_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'capturing', 'complete', 'failed')),
  generation_duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, variant_index)
);

-- User API Key References: Store references to user's API keys
CREATE TABLE IF NOT EXISTS user_api_key_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai', 'google')),
  key_hint TEXT, -- Last 4 characters for display
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_screens_user_id ON screens(user_id);
CREATE INDEX IF NOT EXISTS idx_screen_versions_screen_id ON screen_versions(screen_id);
CREATE INDEX IF NOT EXISTS idx_vibe_sessions_user_id ON vibe_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_vibe_sessions_screen_id ON vibe_sessions(screen_id);
CREATE INDEX IF NOT EXISTS idx_vibe_variant_plans_session_id ON vibe_variant_plans(session_id);
CREATE INDEX IF NOT EXISTS idx_vibe_variants_session_id ON vibe_variants(session_id);
CREATE INDEX IF NOT EXISTS idx_user_api_key_refs_user_id ON user_api_key_refs(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_ui_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_variant_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_key_refs ENABLE ROW LEVEL SECURITY;

-- Screens policies
CREATE POLICY "Users can view their own screens" ON screens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own screens" ON screens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own screens" ON screens
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own screens" ON screens
  FOR DELETE USING (auth.uid() = user_id);

-- Screen versions policies
CREATE POLICY "Users can view versions of their screens" ON screen_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM screens WHERE screens.id = screen_versions.screen_id AND screens.user_id = auth.uid())
  );
CREATE POLICY "Users can insert versions for their screens" ON screen_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM screens WHERE screens.id = screen_versions.screen_id AND screens.user_id = auth.uid())
  );

-- Screen UI metadata policies
CREATE POLICY "Users can view metadata of their screens" ON screen_ui_metadata
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM screens WHERE screens.id = screen_ui_metadata.screen_id AND screens.user_id = auth.uid())
  );
CREATE POLICY "Users can manage metadata of their screens" ON screen_ui_metadata
  FOR ALL USING (
    EXISTS (SELECT 1 FROM screens WHERE screens.id = screen_ui_metadata.screen_id AND screens.user_id = auth.uid())
  );

-- Vibe sessions policies
CREATE POLICY "Users can view their own vibe sessions" ON vibe_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vibe sessions" ON vibe_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vibe sessions" ON vibe_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vibe sessions" ON vibe_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Vibe variant plans policies
CREATE POLICY "Users can view plans of their sessions" ON vibe_variant_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM vibe_sessions WHERE vibe_sessions.id = vibe_variant_plans.session_id AND vibe_sessions.user_id = auth.uid())
  );
CREATE POLICY "Users can manage plans of their sessions" ON vibe_variant_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM vibe_sessions WHERE vibe_sessions.id = vibe_variant_plans.session_id AND vibe_sessions.user_id = auth.uid())
  );

-- Vibe variants policies
CREATE POLICY "Users can view variants of their sessions" ON vibe_variants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM vibe_sessions WHERE vibe_sessions.id = vibe_variants.session_id AND vibe_sessions.user_id = auth.uid())
  );
CREATE POLICY "Users can manage variants of their sessions" ON vibe_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM vibe_sessions WHERE vibe_sessions.id = vibe_variants.session_id AND vibe_sessions.user_id = auth.uid())
  );

-- User API key refs policies
CREATE POLICY "Users can view their own API key refs" ON user_api_key_refs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own API key refs" ON user_api_key_refs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own API key refs" ON user_api_key_refs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own API key refs" ON user_api_key_refs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for vibe files (HTML, thumbnails, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vibe-files', 'vibe-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for vibe-files bucket
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'vibe-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'vibe-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'vibe-files');

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'vibe-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_screens_updated_at
  BEFORE UPDATE ON screens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vibe_sessions_updated_at
  BEFORE UPDATE ON vibe_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vibe_variants_updated_at
  BEFORE UPDATE ON vibe_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_api_key_refs_updated_at
  BEFORE UPDATE ON user_api_key_refs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
