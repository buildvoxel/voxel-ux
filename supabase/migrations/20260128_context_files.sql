-- Migration: Add context files storage
-- This allows users to upload files to each product context category

-- ============================================
-- CONTEXT FILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS context_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('goals', 'kpis', 'backlog', 'knowledge')),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  thumbnail_url TEXT,
  content_preview TEXT, -- First ~500 chars of text content for preview
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_context_files_user_id ON context_files(user_id);
CREATE INDEX IF NOT EXISTS idx_context_files_category ON context_files(category);
CREATE INDEX IF NOT EXISTS idx_context_files_user_category ON context_files(user_id, category);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE context_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own context files" ON context_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own context files" ON context_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own context files" ON context_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own context files" ON context_files
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET FOR CONTEXT FILES
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('context-files', 'context-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for context-files bucket
CREATE POLICY "Users can upload their own context files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'context-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own context files storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'context-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own context files storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'context-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_context_files_updated_at
  BEFORE UPDATE ON context_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
