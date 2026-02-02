/**
 * UX Guidelines Service
 * Handles extraction of UX guidelines from product video frames using vision models
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { UXGuideline, UXGuidelinesSet, UXGuidelineCategory } from '@/types/models';

// Types
export interface ExtractedGuideline {
  category: UXGuidelineCategory;
  title: string;
  description: string;
  examples?: string[];
}

export interface ExtractionResult {
  summary: string;
  guidelines: ExtractedGuideline[];
  model: string;
  provider: string;
  framesAnalyzed?: number;
  durationMs: number;
}

export interface ExtractionProgress {
  stage: 'preparing' | 'extracting-frames' | 'analyzing' | 'complete' | 'failed';
  message: string;
  percent: number;
}

type ProgressCallback = (progress: ExtractionProgress) => void;

/**
 * Extract frames from a video file
 * Returns array of base64-encoded JPEG frames
 */
export async function extractVideoFrames(
  videoFile: File,
  numFrames: number = 8,
  onProgress?: (percent: number) => void
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const frames: string[] = [];
    let duration = 0;

    video.onloadedmetadata = () => {
      duration = video.duration;
      // Set canvas size to video dimensions (max 1280px width for reasonable file size)
      const scale = Math.min(1, 1280 / video.videoWidth);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;

      // Start extracting frames
      extractNextFrame(0);
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };

    const extractNextFrame = (frameIndex: number) => {
      if (frameIndex >= numFrames) {
        // Done extracting
        URL.revokeObjectURL(video.src);
        resolve(frames);
        return;
      }

      // Calculate time for this frame (evenly distributed)
      const time = (duration * frameIndex) / numFrames;
      video.currentTime = time;
    };

    video.onseeked = () => {
      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 JPEG (quality 0.8 for good balance)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      frames.push(base64);

      onProgress?.(Math.round((frames.length / numFrames) * 100));

      // Extract next frame
      extractNextFrame(frames.length);
    };

    // Create object URL and start loading
    video.src = URL.createObjectURL(videoFile);
  });
}

/**
 * Extract UX guidelines from video frames using vision models
 */
export async function extractUXGuidelines(
  videoName: string,
  frames: string[],
  videoDescription?: string,
  provider?: 'anthropic' | 'openai' | 'google',
  model?: string,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Get session for auth token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  // Progress: Analyzing
  onProgress?.({
    stage: 'analyzing',
    message: `Analyzing ${frames.length} frames with vision AI...`,
    percent: 50,
  });

  console.log('[UXGuidelinesService] Extracting guidelines:', {
    videoName,
    framesCount: frames.length,
    hasDescription: !!videoDescription,
  });

  // Call Edge Function
  const { data, error } = await supabase.functions.invoke('extract-ux-guidelines', {
    body: {
      videoName,
      frames,
      videoDescription,
      provider,
      model,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    let actualError = 'Failed to extract UX guidelines';

    if (data?.error) {
      actualError = data.error;
    } else if ((error as unknown as { context?: { json?: () => Promise<{ error?: string }> } }).context) {
      try {
        const context = (error as unknown as { context: { json: () => Promise<{ error?: string }> } }).context;
        const errorBody = await context.json();
        actualError = errorBody?.error || error.message;
      } catch {
        actualError = error.message;
      }
    } else if (error.message) {
      actualError = error.message;
    }

    console.error('[UXGuidelinesService] Edge function error:', error, 'Data:', data, 'Extracted:', actualError);
    onProgress?.({
      stage: 'failed',
      message: `Failed: ${actualError}`,
      percent: 100,
    });
    throw new Error(actualError);
  }

  if (!data?.success) {
    const errorMessage = data?.error || 'UX guidelines extraction failed';
    console.error('[UXGuidelinesService] Extraction failed:', errorMessage);
    onProgress?.({
      stage: 'failed',
      message: `Failed: ${errorMessage}`,
      percent: 100,
    });
    throw new Error(errorMessage);
  }

  // Progress: Complete
  onProgress?.({
    stage: 'complete',
    message: `Extracted ${data.guidelines.length} UX guidelines!`,
    percent: 100,
  });

  console.log('[UXGuidelinesService] Extraction complete:', {
    guidelinesCount: data.guidelines.length,
    framesAnalyzed: data.framesAnalyzed,
    duration: data.durationMs,
  });

  return {
    summary: data.summary,
    guidelines: data.guidelines,
    model: data.model,
    provider: data.provider,
    framesAnalyzed: data.framesAnalyzed,
    durationMs: data.durationMs,
  };
}

/**
 * Full extraction pipeline: video file -> frames -> guidelines
 */
export async function extractGuidelinesFromVideo(
  videoFile: File,
  onProgress?: ProgressCallback,
  numFrames: number = 8,
  provider?: 'anthropic' | 'openai' | 'google',
  model?: string
): Promise<ExtractionResult> {
  // Step 1: Extract frames from video
  onProgress?.({
    stage: 'extracting-frames',
    message: 'Extracting frames from video...',
    percent: 10,
  });

  const frames = await extractVideoFrames(videoFile, numFrames, (percent) => {
    onProgress?.({
      stage: 'extracting-frames',
      message: `Extracting frames... ${percent}%`,
      percent: 10 + (percent * 0.3), // 10-40%
    });
  });

  console.log('[UXGuidelinesService] Extracted', frames.length, 'frames from video');

  // Step 2: Send frames to vision API for analysis
  onProgress?.({
    stage: 'analyzing',
    message: 'Analyzing frames with vision AI...',
    percent: 45,
  });

  const result = await extractUXGuidelines(
    videoFile.name,
    frames,
    undefined,
    provider,
    model,
    (progress) => {
      // Map analyzing progress to 45-100%
      if (progress.stage === 'analyzing') {
        onProgress?.({
          ...progress,
          percent: 45 + (progress.percent * 0.55),
        });
      } else {
        onProgress?.(progress);
      }
    }
  );

  return result;
}

/**
 * Convert extracted guidelines to a UXGuidelinesSet for storage
 */
export function createGuidelinesSet(
  name: string,
  extractionResult: ExtractionResult,
  sourceVideoId?: string,
  sourceVideoName?: string
): UXGuidelinesSet {
  const now = new Date().toISOString();

  const guidelines: UXGuideline[] = extractionResult.guidelines.map((g, index) => ({
    id: `uxg-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    category: g.category,
    title: g.title,
    description: g.description,
    examples: g.examples,
  }));

  return {
    id: `uxgs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    sourceVideoId,
    sourceVideoName,
    guidelines,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Demo: Extract guidelines with mock data
 * Useful for testing without actual video processing
 */
export async function extractGuidelinesDemo(
  _videoName: string,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  // Simulate progress for demo
  onProgress?.({
    stage: 'preparing',
    message: 'Preparing demo extraction...',
    percent: 10,
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  onProgress?.({
    stage: 'analyzing',
    message: 'Analyzing UX patterns (demo mode)...',
    percent: 50,
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return demo guidelines
  const demoGuidelines: ExtractedGuideline[] = [
    {
      category: 'navigation',
      title: 'Persistent Sidebar Navigation',
      description: 'The main navigation is always visible in a left sidebar. Items are organized by feature area with icons and text labels.',
      examples: ['Dashboard icon + "Dashboard"', 'Settings gear + "Settings"'],
    },
    {
      category: 'interaction',
      title: 'Primary Action Button Style',
      description: 'Primary actions use filled buttons with the brand color. Secondary actions use outlined buttons. Destructive actions are red.',
      examples: ['Blue "Save" button', 'Outlined "Cancel" button', 'Red "Delete" button'],
    },
    {
      category: 'feedback',
      title: 'Toast Notifications',
      description: 'Success and error feedback appears as toast notifications in the bottom-right corner. They auto-dismiss after 5 seconds.',
      examples: ['Green checkmark + "Changes saved"', 'Red X + "Error saving changes"'],
    },
    {
      category: 'layout',
      title: 'Card-Based Content',
      description: 'Content is organized in cards with consistent padding (24px) and border-radius (8px). Cards have subtle shadows.',
    },
    {
      category: 'flow',
      title: 'Multi-Step Forms',
      description: 'Complex forms are broken into steps with a progress indicator at the top. Users can navigate back but not skip ahead.',
      examples: ['Step 1 of 3 indicator', 'Back/Next buttons'],
    },
  ];

  onProgress?.({
    stage: 'complete',
    message: `Extracted ${demoGuidelines.length} UX guidelines (demo)`,
    percent: 100,
  });

  return {
    summary: 'Demo UX guidelines showing common patterns like sidebar navigation, button styles, and toast notifications.',
    guidelines: demoGuidelines,
    model: 'demo',
    provider: 'demo',
    durationMs: 1500,
  };
}
