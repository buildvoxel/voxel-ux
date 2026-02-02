/**
 * Context Files Service
 * Handles file uploads and management for Product Context categories
 * Supports both Supabase storage and local mock mode for demos
 */

import { supabase, isSupabaseConfigured } from './supabase';

export type ContextCategory = 'goals' | 'ux-guidelines' | 'backlog' | 'knowledge';

export interface ContextFile {
  id: string;
  userId: string;
  category: ContextCategory;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  mimeType?: string;
  thumbnailUrl?: string;
  contentPreview?: string;
  createdAt: string;
  updatedAt: string;
  // For local mock mode - store the file data URL
  localDataUrl?: string;
}

export interface UploadContextFileParams {
  category: ContextCategory;
  title: string;
  description?: string;
  file: File;
}

// Local storage key for mock files
const LOCAL_STORAGE_KEY = 'voxel_context_files';

/**
 * Get mock files from localStorage
 */
function getLocalFiles(): ContextFile[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save mock files to localStorage
 */
function saveLocalFiles(files: ContextFile[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(files));
  } catch (e) {
    console.warn('[ContextFilesService] Failed to save to localStorage:', e);
    // If localStorage is full, try to save without the data URLs (metadata only)
    try {
      const metadataOnly = files.map(f => ({ ...f, localDataUrl: undefined }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(metadataOnly));
      console.warn('[ContextFilesService] Saved metadata only due to storage limits');
    } catch {
      // If that also fails, throw an error
      throw new Error('Local storage is full. Please delete some files or clear browser storage.');
    }
  }
}

/**
 * Convert File to data URL for local storage
 */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if we should use local mock mode
 */
async function shouldUseMockMode(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !user;
  } catch {
    return true;
  }
}

/**
 * Get all context files for the current user
 */
export async function getContextFiles(category?: ContextCategory): Promise<ContextFile[]> {
  const useMock = await shouldUseMockMode();

  if (useMock) {
    // Return mock files from localStorage
    let files = getLocalFiles();
    if (category) {
      files = files.filter(f => f.category === category);
    }
    return files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Use Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[ContextFilesService] No authenticated user');
    return [];
  }

  let query = supabase
    .from('context_files')
    .select('*')
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[ContextFilesService] Error fetching files:', error);
    throw new Error(`Failed to fetch context files: ${error.message}`);
  }

  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    category: row.category as ContextCategory,
    title: row.title,
    description: row.description,
    fileName: row.file_name,
    filePath: row.file_path,
    fileType: row.file_type,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    thumbnailUrl: row.thumbnail_url,
    contentPreview: row.content_preview,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Upload a context file
 */
export async function uploadContextFile(params: UploadContextFileParams): Promise<ContextFile> {
  const { category, title, description, file } = params;
  const useMock = await shouldUseMockMode();

  if (useMock) {
    // Mock upload - store in localStorage
    // Check file size - localStorage has a ~5MB limit total, so limit individual files to 2MB
    const MAX_LOCAL_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_LOCAL_FILE_SIZE) {
      console.warn(`[ContextFilesService] File too large for local storage: ${file.size} bytes`);
      // Still allow the upload but don't store the data URL
    }

    let dataUrl: string | undefined;
    if (file.size <= MAX_LOCAL_FILE_SIZE) {
      try {
        dataUrl = await fileToDataUrl(file);
      } catch (e) {
        console.warn('[ContextFilesService] Failed to convert file to data URL:', e);
      }
    }

    const fileType = getFileType(file.type, file.name);

    // Extract content preview for text files
    let contentPreview: string | undefined;
    if (fileType === 'text' || fileType === 'document') {
      try {
        const text = await file.text();
        contentPreview = text.substring(0, 500);
      } catch {
        // Ignore preview extraction errors
      }
    }

    const newFile: ContextFile = {
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'mock_user',
      category,
      title,
      description,
      fileName: file.name,
      filePath: `mock/${category}/${file.name}`,
      fileType,
      fileSize: file.size,
      mimeType: file.type,
      contentPreview,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      localDataUrl: dataUrl,
    };

    const files = getLocalFiles();
    files.unshift(newFile);

    try {
      saveLocalFiles(files);
    } catch (e) {
      // If save fails, try saving without the data URL
      newFile.localDataUrl = undefined;
      files[0] = newFile;
      saveLocalFiles(files);
      console.warn('[ContextFilesService] Saved file metadata only due to storage limits');
    }

    return newFile;
  }

  // Use Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be logged in to upload files');
  }

  // Generate unique file path (userId first to match RLS policies)
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${user.id}/context/${category}/${timestamp}_${sanitizedFileName}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('editor-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('[ContextFilesService] Upload error:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Get file type
  const fileType = getFileType(file.type, file.name);

  // Extract content preview for text files
  let contentPreview: string | undefined;
  if (fileType === 'text' || fileType === 'document') {
    try {
      const text = await file.text();
      contentPreview = text.substring(0, 500);
    } catch {
      // Ignore preview extraction errors
    }
  }

  // Create database record
  const { data, error: dbError } = await supabase
    .from('context_files')
    .insert({
      user_id: user.id,
      category,
      title,
      description,
      file_name: file.name,
      file_path: filePath,
      file_type: fileType,
      file_size: file.size,
      mime_type: file.type,
      content_preview: contentPreview,
    })
    .select()
    .single();

  if (dbError) {
    console.error('[ContextFilesService] Database error:', dbError);
    // Try to clean up the uploaded file
    await supabase.storage.from('context-files').remove([filePath]);
    throw new Error(`Failed to save file record: ${dbError.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    category: data.category as ContextCategory,
    title: data.title,
    description: data.description,
    fileName: data.file_name,
    filePath: data.file_path,
    fileType: data.file_type,
    fileSize: data.file_size,
    mimeType: data.mime_type,
    thumbnailUrl: data.thumbnail_url,
    contentPreview: data.content_preview,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Delete a context file
 */
export async function deleteContextFile(fileId: string): Promise<void> {
  const useMock = await shouldUseMockMode();

  if (useMock) {
    // Mock delete - remove from localStorage
    const files = getLocalFiles();
    const updatedFiles = files.filter(f => f.id !== fileId);
    saveLocalFiles(updatedFiles);
    return;
  }

  // Use Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be logged in to delete files');
  }

  // Get file record to get the storage path
  const { data: file, error: fetchError } = await supabase
    .from('context_files')
    .select('file_path')
    .eq('id', fileId)
    .single();

  if (fetchError) {
    throw new Error(`File not found: ${fetchError.message}`);
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('editor-images')
    .remove([file.file_path]);

  if (storageError) {
    console.error('[ContextFilesService] Storage delete error:', storageError);
  }

  // Delete database record
  const { error: dbError } = await supabase
    .from('context_files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    throw new Error(`Failed to delete file: ${dbError.message}`);
  }
}

/**
 * Get a download URL for a context file
 */
export async function getFileDownloadUrl(filePath: string): Promise<string> {
  const useMock = await shouldUseMockMode();

  if (useMock) {
    // For mock files, find the file and return its data URL
    const files = getLocalFiles();
    const file = files.find(f => f.filePath === filePath);
    if (file?.localDataUrl) {
      return file.localDataUrl;
    }
    if (file) {
      // File exists but data URL wasn't stored (too large)
      throw new Error('File content not available in demo mode. Files larger than 2MB are not stored locally.');
    }
    throw new Error('File not found in local storage');
  }

  // Use Supabase
  const { data, error } = await supabase.storage
    .from('editor-images')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) {
    throw new Error(`Failed to get download URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Determine file type from mime type and extension
 */
function getFileType(mimeType: string, fileName: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('spreadsheet') || fileName.match(/\.(xlsx?|csv)$/i)) return 'spreadsheet';
  if (mimeType.includes('presentation') || fileName.match(/\.(pptx?|key)$/i)) return 'presentation';
  if (mimeType.includes('document') || mimeType.includes('word') || fileName.match(/\.(docx?|rtf)$/i)) return 'document';
  if (mimeType.startsWith('text/') || fileName.match(/\.(txt|md|json|xml)$/i)) return 'text';
  return 'other';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get icon name for file type
 */
export function getFileTypeIcon(fileType: string): string {
  const icons: Record<string, string> = {
    image: 'Image',
    video: 'Video',
    audio: 'MusicNote',
    pdf: 'FilePdf',
    spreadsheet: 'FileXls',
    presentation: 'Presentation',
    document: 'FileDoc',
    text: 'FileText',
    other: 'File',
  };
  return icons[fileType] || 'File';
}
