/**
 * Wireframe Service
 * Generates text-based wireframe descriptions for variant plans
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { compactHtml } from './htmlCompactor';
import type { UIMetadata } from './screenAnalyzerService';
import type { VariantPlan } from './variantPlanService';

// Types
export interface WireframeResult {
  variantIndex: number;
  planId: string;
  wireframeText: string;
  layoutDescription: string;
  componentList: string[];
}

export interface GeneratedWireframes {
  wireframes: WireframeResult[];
  model: string;
  provider: string;
}

export interface WireframeProgress {
  stage: 'preparing' | 'generating' | 'saving' | 'complete';
  message: string;
  percent: number;
}

type ProgressCallback = (progress: WireframeProgress) => void;

/**
 * Generate wireframes for all variant plans
 */
export async function generateWireframes(
  sessionId: string,
  plans: VariantPlan[],
  html: string,
  uiMetadata?: UIMetadata,
  onProgress?: ProgressCallback
): Promise<GeneratedWireframes> {
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
    message: 'Preparing wireframe generation...',
    percent: 10,
  });

  // Update session status
  await supabase
    .from('vibe_sessions')
    .update({ status: 'wireframing' })
    .eq('id', sessionId);

  // Compact HTML for smaller payload
  const compactionResult = await compactHtml(html, { method: 'combined-optimal' });
  const compactedHtml = compactionResult.html;

  console.log('[WireframeService] HTML compaction:', {
    originalSize: compactionResult.originalSize,
    compactedSize: compactionResult.compactedSize,
    reductionPercent: compactionResult.reductionPercent,
  });

  // Progress: Generating
  onProgress?.({
    stage: 'generating',
    message: 'AI is creating wireframe layouts...',
    percent: 30,
  });

  // Prepare plans for the edge function
  const plansPayload = plans.map(p => ({
    id: p.id,
    variantIndex: p.variant_index,
    title: p.title,
    description: p.description,
    keyChanges: p.key_changes,
    styleNotes: p.style_notes || '',
  }));

  console.log('[WireframeService] Calling generate-wireframes edge function:', {
    sessionId,
    plansCount: plansPayload.length,
    htmlLength: compactedHtml.length,
  });

  // Call Edge Function
  const { data, error } = await supabase.functions.invoke('generate-wireframes', {
    body: {
      sessionId,
      plans: plansPayload,
      compactedHtml,
      uiMetadata,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    console.error('[WireframeService] Edge function error:', error);
    // Update session status to failed
    await supabase
      .from('vibe_sessions')
      .update({ status: 'failed', error_message: error.message })
      .eq('id', sessionId);
    throw new Error(error.message || 'Failed to generate wireframes');
  }

  if (!data.success) {
    console.error('[WireframeService] Generation failed:', data.error);
    await supabase
      .from('vibe_sessions')
      .update({ status: 'failed', error_message: data.error })
      .eq('id', sessionId);
    throw new Error(data.error || 'Wireframe generation failed');
  }

  // Progress: Complete
  onProgress?.({
    stage: 'complete',
    message: 'Wireframes ready for review!',
    percent: 100,
  });

  console.log('[WireframeService] Generated', data.wireframes?.length, 'wireframes');

  return {
    wireframes: data.wireframes || [],
    model: data.model,
    provider: data.provider,
  };
}

/**
 * Get wireframe data for plans (if already generated)
 */
export async function getWireframesForSession(sessionId: string): Promise<WireframeResult[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('vibe_variant_plans')
    .select('id, variant_index, wireframe_text, layout_description, component_list')
    .eq('session_id', sessionId)
    .not('wireframe_text', 'is', null)
    .order('variant_index', { ascending: true });

  if (error) {
    console.error('[WireframeService] Error fetching wireframes:', error);
    return [];
  }

  return (data || []).map(row => ({
    variantIndex: row.variant_index,
    planId: row.id,
    wireframeText: row.wireframe_text || '',
    layoutDescription: row.layout_description || '',
    componentList: row.component_list || [],
  }));
}
