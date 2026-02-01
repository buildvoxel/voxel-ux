/**
 * UX Guidelines Service
 * Handles extraction of UX guidelines from product video transcripts
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
  durationMs: number;
}

export interface ExtractionProgress {
  stage: 'preparing' | 'extracting' | 'complete' | 'failed';
  message: string;
  percent: number;
}

type ProgressCallback = (progress: ExtractionProgress) => void;

/**
 * Extract UX guidelines from a video transcript
 */
export async function extractUXGuidelines(
  videoName: string,
  transcript: string,
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

  // Progress: Preparing
  onProgress?.({
    stage: 'preparing',
    message: 'Preparing transcript for analysis...',
    percent: 10,
  });

  console.log('[UXGuidelinesService] Extracting guidelines:', {
    videoName,
    transcriptLength: transcript.length,
    hasDescription: !!videoDescription,
  });

  // Progress: Extracting
  onProgress?.({
    stage: 'extracting',
    message: 'AI is analyzing the video for UX patterns...',
    percent: 30,
  });

  // Call Edge Function
  const { data, error } = await supabase.functions.invoke('extract-ux-guidelines', {
    body: {
      videoName,
      transcript,
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
    duration: data.durationMs,
  });

  return {
    summary: data.summary,
    guidelines: data.guidelines,
    model: data.model,
    provider: data.provider,
    durationMs: data.durationMs,
  };
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
 * Demo: Extract guidelines from a mock transcript
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
    stage: 'extracting',
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
