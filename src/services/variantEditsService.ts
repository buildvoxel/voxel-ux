/**
 * Variant Edits Service
 *
 * Generates and applies edit operations to create variants from original HTML.
 * This is much more efficient than generating complete HTML from scratch.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { VariantPlan } from './variantPlanService';

// Types
export interface EditOperation {
  find: string;
  replace: string;
  description?: string;
}

export interface VariantEdits {
  variantIndex: number;
  planId: string;
  edits: EditOperation[];
  summary: string;
}

export interface ApplyEditsResult {
  html: string;
  appliedEdits: number;
  failedEdits: EditOperation[];
}

export interface GenerateEditsProgress {
  stage: 'preparing' | 'generating' | 'applying' | 'saving' | 'complete';
  message: string;
  percent: number;
  variantIndex?: number;
}

type ProgressCallback = (progress: GenerateEditsProgress) => void;

/**
 * Apply edit operations to HTML
 * Returns the modified HTML and info about which edits succeeded/failed
 */
export function applyEdits(html: string, edits: EditOperation[]): ApplyEditsResult {
  let result = html;
  let appliedEdits = 0;
  const failedEdits: EditOperation[] = [];

  for (const edit of edits) {
    if (result.includes(edit.find)) {
      result = result.replace(edit.find, edit.replace);
      appliedEdits++;
    } else {
      console.warn('[applyEdits] Could not find string to replace:', edit.find.substring(0, 100));
      failedEdits.push(edit);
    }
  }

  return { html: result, appliedEdits, failedEdits };
}

/**
 * Generate edit operations for all variant plans
 */
export async function generateVariantEdits(
  sessionId: string,
  plans: VariantPlan[],
  originalHtml: string,
  onProgress?: ProgressCallback,
  screenshotBase64?: string,
  provider?: string,
  model?: string
): Promise<VariantEdits[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  onProgress?.({
    stage: 'preparing',
    message: 'Preparing edit generation...',
    percent: 10,
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

  console.log('[VariantEditsService] Calling generate-variant-edits:', {
    sessionId,
    plansCount: plansPayload.length,
    htmlLength: originalHtml.length,
  });

  onProgress?.({
    stage: 'generating',
    message: 'AI is generating edit operations...',
    percent: 30,
  });

  // Call Edge Function
  const { data, error } = await supabase.functions.invoke('generate-variant-edits', {
    body: {
      sessionId,
      plans: plansPayload,
      originalHtml,
      screenshotBase64,
      provider,
      model,
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    console.error('[VariantEditsService] Edge function error:', error);
    throw new Error(error.message || 'Failed to generate variant edits');
  }

  if (!data.success) {
    console.error('[VariantEditsService] Generation failed:', data.error);
    throw new Error(data.error || 'Variant edits generation failed');
  }

  console.log('[VariantEditsService] Generated edits for', data.variantEdits?.length, 'variants');

  onProgress?.({
    stage: 'complete',
    message: 'Edit operations ready!',
    percent: 100,
  });

  return data.variantEdits || [];
}

/**
 * Generate variants by applying edits to original HTML
 * This is the main entry point that:
 * 1. Generates edit operations via LLM
 * 2. Applies edits to create variant HTML
 * 3. Saves results to storage and database
 */
export async function generateVariantsFromEdits(
  sessionId: string,
  plans: VariantPlan[],
  originalHtml: string,
  onProgress?: ProgressCallback,
  onVariantComplete?: (variantIndex: number, html: string) => void,
  screenshotBase64?: string,
  provider?: string,
  model?: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id;

  // Update session status
  await supabase
    .from('vibe_sessions')
    .update({ status: 'generating' })
    .eq('id', sessionId);

  try {
    // Step 1: Generate edit operations
    const variantEdits = await generateVariantEdits(
      sessionId,
      plans,
      originalHtml,
      (progress) => {
        // Map progress to 0-50% range
        onProgress?.({
          ...progress,
          percent: progress.percent * 0.5,
        });
      },
      screenshotBase64,
      provider,
      model
    );

    // Step 2: Apply edits and save each variant
    for (let i = 0; i < variantEdits.length; i++) {
      const variantEdit = variantEdits[i];
      const progressBase = 50 + (i / variantEdits.length) * 40;

      onProgress?.({
        stage: 'applying',
        message: `Applying edits for Variant ${String.fromCharCode(64 + variantEdit.variantIndex)}...`,
        percent: progressBase,
        variantIndex: variantEdit.variantIndex,
      });

      // Apply edits to original HTML
      const { html: variantHtml, appliedEdits, failedEdits } = applyEdits(originalHtml, variantEdit.edits);

      console.log(`[VariantEditsService] Variant ${variantEdit.variantIndex}: Applied ${appliedEdits}/${variantEdit.edits.length} edits`);

      if (failedEdits.length > 0) {
        console.warn(`[VariantEditsService] Variant ${variantEdit.variantIndex}: ${failedEdits.length} edits failed`);
      }

      // Notify caller of completed variant
      onVariantComplete?.(variantEdit.variantIndex, variantHtml);

      onProgress?.({
        stage: 'saving',
        message: `Saving Variant ${String.fromCharCode(64 + variantEdit.variantIndex)}...`,
        percent: progressBase + 5,
        variantIndex: variantEdit.variantIndex,
      });

      // Save to storage
      const htmlPath = `${userId}/${sessionId}/variant_${variantEdit.variantIndex}.html`;
      const { error: uploadError } = await supabase.storage
        .from('vibe-files')
        .upload(htmlPath, new Blob([variantHtml], { type: 'text/html' }), {
          contentType: 'text/html',
          upsert: true,
        });

      if (uploadError) {
        console.error(`[VariantEditsService] Failed to upload variant ${variantEdit.variantIndex}:`, uploadError);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('vibe-files')
        .getPublicUrl(htmlPath);

      // Check if variant record exists
      const { data: existingVariant } = await supabase
        .from('vibe_variants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('variant_index', variantEdit.variantIndex)
        .single();

      if (existingVariant) {
        // Update existing variant
        await supabase
          .from('vibe_variants')
          .update({
            html_path: htmlPath,
            html_url: urlData.publicUrl,
            status: 'complete',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingVariant.id);
      } else {
        // Create new variant record
        await supabase
          .from('vibe_variants')
          .insert({
            session_id: sessionId,
            plan_id: variantEdit.planId,
            variant_index: variantEdit.variantIndex,
            html_path: htmlPath,
            html_url: urlData.publicUrl,
            status: 'complete',
          });
      }
    }

    // Update session status to complete
    await supabase
      .from('vibe_sessions')
      .update({ status: 'complete' })
      .eq('id', sessionId);

    onProgress?.({
      stage: 'complete',
      message: 'All variants generated!',
      percent: 100,
    });

  } catch (error) {
    console.error('[VariantEditsService] Error:', error);

    // Update session status to failed
    await supabase
      .from('vibe_sessions')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', sessionId);

    throw error;
  }
}

/**
 * Get stored edit operations for a session
 */
export async function getEditsForSession(sessionId: string): Promise<VariantEdits[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('vibe_variant_plans')
    .select('id, variant_index, edit_operations, edit_summary')
    .eq('session_id', sessionId)
    .not('edit_operations', 'is', null)
    .order('variant_index', { ascending: true });

  if (error) {
    console.error('[VariantEditsService] Error fetching edits:', error);
    return [];
  }

  return (data || []).map(row => ({
    variantIndex: row.variant_index,
    planId: row.id,
    edits: row.edit_operations || [],
    summary: row.edit_summary || '',
  }));
}
