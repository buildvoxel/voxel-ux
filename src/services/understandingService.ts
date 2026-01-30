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
    console.error('[UnderstandingService] Edge function error:', error);
    onProgress?.({
      stage: 'failed',
      message: `Failed: ${error.message}`,
      percent: 100,
    });
    throw new Error(error.message || 'Failed to generate understanding');
  }

  if (!data.success) {
    console.error('[UnderstandingService] Understanding failed:', data.error);
    onProgress?.({
      stage: 'failed',
      message: `Failed: ${data.error}`,
      percent: 100,
    });
    throw new Error(data.error || 'Understanding generation failed');
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
