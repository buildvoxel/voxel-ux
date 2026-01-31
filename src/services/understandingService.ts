/**
 * Understanding Service
 * Handles the LLM understanding/interpretation phase before planning
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { UIMetadata } from './screenAnalyzerService';

// Types
export interface UnderstandingResponse {
  summary: string;
  goals: string[];
  scope: string;
  assumptions: string[];
  clarifyingQuestions?: string[];
}

export interface GeneratedUnderstanding {
  understanding: UnderstandingResponse;
  understandingText: string;
  model: string;
  provider: string;
  durationMs: number;
}

export interface UnderstandingProgress {
  stage: 'preparing' | 'analyzing' | 'complete' | 'failed';
  message: string;
  percent: number;
}

type ProgressCallback = (progress: UnderstandingProgress) => void;

/**
 * Generate LLM understanding of user's design request
 */
export async function generateUnderstanding(
  sessionId: string,
  prompt: string,
  compactedHtml: string,
  uiMetadata?: UIMetadata,
  productContext?: string,
  provider?: 'anthropic' | 'openai' | 'google',
  model?: string,
  onProgress?: ProgressCallback
): Promise<GeneratedUnderstanding> {
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
    message: 'Preparing your request...',
    percent: 10,
  });

  console.log('[UnderstandingService] Generating understanding:', {
    sessionId,
    promptLength: prompt.length,
    htmlLength: compactedHtml.length,
    hasMetadata: !!uiMetadata,
    hasContext: !!productContext,
  });

  // Progress: Analyzing
  onProgress?.({
    stage: 'analyzing',
    message: 'AI is analyzing your request...',
    percent: 30,
  });

  // Call Edge Function
  const { data, error } = await supabase.functions.invoke('understand-request', {
    body: {
      sessionId,
      prompt,
      compactedHtml,
      uiMetadata,
      productContext,
      provider,
      model,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    // Try to extract the actual error from multiple possible locations
    // Supabase edge function errors can have the message in different places
    let actualError = 'Failed to generate understanding';

    // Check data.error first (our edge function format)
    if (data?.error) {
      actualError = data.error;
    }
    // Check error.context for FunctionsHttpError
    else if ((error as unknown as { context?: { json?: () => Promise<{ error?: string }> } }).context) {
      try {
        const context = (error as unknown as { context: { json: () => Promise<{ error?: string }> } }).context;
        const errorBody = await context.json();
        actualError = errorBody?.error || error.message;
      } catch {
        actualError = error.message;
      }
    }
    // Fallback to error.message
    else if (error.message) {
      actualError = error.message;
    }

    console.error('[UnderstandingService] Edge function error:', error, 'Data:', data, 'Extracted:', actualError);
    onProgress?.({
      stage: 'failed',
      message: `Failed: ${actualError}`,
      percent: 100,
    });
    throw new Error(actualError);
  }

  if (!data?.success) {
    const errorMessage = data?.error || 'Understanding generation failed';
    console.error('[UnderstandingService] Understanding failed:', errorMessage);
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
    message: 'Analysis complete!',
    percent: 100,
  });

  console.log('[UnderstandingService] Understanding complete:', {
    goalsCount: data.understanding.goals.length,
    duration: data.durationMs,
  });

  return {
    understanding: data.understanding,
    understandingText: data.understandingText,
    model: data.model,
    provider: data.provider,
    durationMs: data.durationMs,
  };
}

/**
 * Approve the understanding and proceed to planning
 */
export async function approveUnderstanding(sessionId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('vibe_sessions')
    .update({
      understanding_approved: true,
      understanding_approved_at: new Date().toISOString(),
      status: 'planning',
    })
    .eq('id', sessionId);

  if (error) {
    console.error('[UnderstandingService] Error approving understanding:', error);
    return false;
  }

  return true;
}

/**
 * Provide clarification/elaboration on the request
 * This will regenerate understanding with additional context
 */
export async function clarifyRequest(
  sessionId: string,
  originalPrompt: string,
  clarification: string,
  compactedHtml: string,
  uiMetadata?: UIMetadata,
  productContext?: string,
  provider?: 'anthropic' | 'openai' | 'google',
  model?: string,
  onProgress?: ProgressCallback
): Promise<GeneratedUnderstanding> {
  // Combine original prompt with clarification
  const enhancedPrompt = `${originalPrompt}

Additional clarification from user:
${clarification}`;

  return generateUnderstanding(
    sessionId,
    enhancedPrompt,
    compactedHtml,
    uiMetadata,
    productContext,
    provider,
    model,
    onProgress
  );
}

/**
 * Get current understanding for a session
 */
export async function getSessionUnderstanding(sessionId: string): Promise<{
  understanding: string | null;
  approved: boolean;
  approvedAt: string | null;
} | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('vibe_sessions')
    .select('llm_understanding, understanding_approved, understanding_approved_at')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('[UnderstandingService] Error fetching understanding:', error);
    return null;
  }

  return {
    understanding: data.llm_understanding,
    approved: data.understanding_approved || false,
    approvedAt: data.understanding_approved_at,
  };
}
