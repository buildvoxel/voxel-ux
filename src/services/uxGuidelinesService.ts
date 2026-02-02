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
 * Convert video file to base64
 */
export async function videoToBase64(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read video file'));
    reader.readAsDataURL(videoFile);
  });
}

/**
 * Extract UX guidelines using vision models
 * Supports both frames (for Claude/OpenAI) and native video (for Gemini)
 */
export async function extractUXGuidelines(
  videoName: string,
  options: {
    frames?: string[];
    videoBase64?: string;
    videoMimeType?: string;
  },
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

  const isVideoMode = !!(options.videoBase64 && options.videoMimeType);
  const framesCount = options.frames?.length || 0;

  // Progress: Analyzing
  onProgress?.({
    stage: 'analyzing',
    message: isVideoMode
      ? 'Analyzing video with Gemini vision AI...'
      : `Analyzing ${framesCount} frames with vision AI...`,
    percent: 50,
  });

  console.log('[UXGuidelinesService] Extracting guidelines:', {
    videoName,
    mode: isVideoMode ? 'native-video' : 'frames',
    framesCount,
    hasDescription: !!videoDescription,
  });

  // Call Edge Function
  const { data, error } = await supabase.functions.invoke('extract-ux-guidelines', {
    body: {
      videoName,
      frames: options.frames,
      videoBase64: options.videoBase64,
      videoMimeType: options.videoMimeType,
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
 * Get the user's configured AI provider
 */
async function getUserProvider(): Promise<'anthropic' | 'openai' | 'google' | null> {
  try {
    const { data, error } = await supabase
      .from('user_api_key_refs')
      .select('provider')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error || !data) return null;
    return data.provider as 'anthropic' | 'openai' | 'google';
  } catch {
    return null;
  }
}

/**
 * Full extraction pipeline: video file -> guidelines
 * Automatically uses native video for Gemini, frames for Claude/OpenAI
 */
export async function extractGuidelinesFromVideo(
  videoFile: File,
  onProgress?: ProgressCallback,
  numFrames: number = 8,
  provider?: 'anthropic' | 'openai' | 'google',
  model?: string
): Promise<ExtractionResult> {
  // Determine which provider to use
  const effectiveProvider = provider || await getUserProvider();
  const useNativeVideo = effectiveProvider === 'google';

  console.log('[UXGuidelinesService] Provider:', effectiveProvider, 'Mode:', useNativeVideo ? 'native-video' : 'frames');

  if (useNativeVideo) {
    // Gemini: Send video directly (native video support!)
    onProgress?.({
      stage: 'preparing',
      message: 'Preparing video for Gemini analysis...',
      percent: 10,
    });

    const videoBase64 = await videoToBase64(videoFile);
    const videoMimeType = videoFile.type || 'video/mp4';

    console.log('[UXGuidelinesService] Video ready for Gemini:', {
      size: `${(videoBase64.length / 1024 / 1024).toFixed(1)}MB`,
      mimeType: videoMimeType,
    });

    onProgress?.({
      stage: 'analyzing',
      message: 'Analyzing video with Gemini vision AI...',
      percent: 30,
    });

    const result = await extractUXGuidelines(
      videoFile.name,
      { videoBase64, videoMimeType },
      undefined,
      provider,
      model,
      (progress) => {
        if (progress.stage === 'analyzing') {
          onProgress?.({
            ...progress,
            percent: 30 + (progress.percent * 0.7),
          });
        } else {
          onProgress?.(progress);
        }
      }
    );

    return result;
  } else {
    // Claude/OpenAI: Extract frames and send
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

    onProgress?.({
      stage: 'analyzing',
      message: 'Analyzing frames with vision AI...',
      percent: 45,
    });

    const result = await extractUXGuidelines(
      videoFile.name,
      { frames },
      undefined,
      provider,
      model,
      (progress) => {
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

