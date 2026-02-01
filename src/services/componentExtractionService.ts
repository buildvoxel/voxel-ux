/**
 * Component Extraction Service
 * Uses LLM vision capabilities to extract reusable UI components from screens
 */

import { supabase } from './supabase';
import { captureHtmlScreenshot, compressScreenshot } from './screenshotService';

export type ComponentCategory =
  | 'button'
  | 'input'
  | 'card'
  | 'navigation'
  | 'header'
  | 'footer'
  | 'modal'
  | 'list'
  | 'table'
  | 'image'
  | 'icon'
  | 'badge'
  | 'alert'
  | 'form'
  | 'dropdown'
  | 'tabs'
  | 'other';

export interface ComponentVariant {
  name: string;
  html: string;
  css: string;
}

export interface ExtractedComponentLLM {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  html: string;
  css: string;
  variants?: ComponentVariant[];
  props?: string[];
  sourceScreenId: string;
  sourceScreenIds: string[];
  extractedAt: string;
  generatedBy: 'llm';
  occurrences: number;
}

export interface ExtractionProgress {
  screenIndex: number;
  totalScreens: number;
  screenName: string;
  status: 'capturing' | 'extracting' | 'complete' | 'error';
  message: string;
  // Enhanced tracking
  startTime: number;
  elapsedMs: number;
  estimatedTotalMs?: number;
  estimatedRemainingMs?: number;
  screensCompleted: number;
  componentsFound: number;
  currentStep: 'screenshot' | 'compress' | 'upload' | 'llm-processing' | 'parsing' | 'done';
  stepDetail?: string;
}

export interface ExtractionResult {
  success: boolean;
  components: ExtractedComponentLLM[];
  error?: string;
  provider?: string;
  model?: string;
  durationMs?: number;
}

/**
 * Extract components from a single screen using LLM vision
 */
export async function extractComponentsFromScreen(
  screenId: string,
  html: string,
  screenshotBase64?: string,
  options?: {
    provider?: 'anthropic' | 'openai' | 'google';
    model?: string;
  }
): Promise<ExtractionResult> {
  try {
    // Get screenshot if not provided
    let screenshot = screenshotBase64;
    if (!screenshot) {
      console.log('[ComponentExtraction] Capturing screenshot for screen:', screenId);
      const result = await captureHtmlScreenshot(html, {
        maxWidth: 1280,
        maxHeight: 800,
        quality: 0.8,
        format: 'jpeg',
      });

      if (!result) {
        throw new Error('Failed to capture screenshot');
      }

      // Compress if needed (target 400KB for API limits)
      screenshot = await compressScreenshot(result.base64, 400);
    }

    // Get a fresh session - refresh to ensure token is valid
    let accessToken: string | undefined;

    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshData.session) {
      console.log('[ComponentExtraction] Refresh failed, trying getSession:', refreshError?.message);
      // Fall back to getSession if refresh fails
      const { data: { session: fallbackSession } } = await supabase.auth.getSession();
      if (!fallbackSession?.access_token) {
        throw new Error('Not authenticated - please sign in again');
      }
      accessToken = fallbackSession.access_token;
      console.log('[ComponentExtraction] Using fallback session token');
    } else {
      accessToken = refreshData.session.access_token;
      console.log('[ComponentExtraction] Using refreshed session token');
    }

    console.log('[ComponentExtraction] Token available, length:', accessToken.length);

    // Call the edge function with explicit auth header
    console.log('[ComponentExtraction] Calling extract-components edge function');
    const response = await supabase.functions.invoke('extract-components', {
      body: {
        screenId,
        html,
        screenshotBase64: screenshot,
        provider: options?.provider,
        model: options?.model,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Edge function error');
    }

    const data = response.data as {
      success: boolean;
      components?: Array<{
        id: string;
        name: string;
        category: string;
        description: string;
        html: string;
        css: string;
        variants?: ComponentVariant[];
        props?: string[];
      }>;
      error?: string;
      provider?: string;
      model?: string;
      durationMs?: number;
    };

    if (!data.success) {
      throw new Error(data.error || 'Extraction failed');
    }

    // Transform components to include source info
    const now = new Date().toISOString();
    const components: ExtractedComponentLLM[] = (data.components || []).map((comp) => ({
      ...comp,
      category: comp.category as ComponentCategory,
      sourceScreenId: screenId,
      sourceScreenIds: [screenId],
      extractedAt: now,
      generatedBy: 'llm' as const,
      occurrences: 1,
    }));

    return {
      success: true,
      components,
      provider: data.provider,
      model: data.model,
      durationMs: data.durationMs,
    };
  } catch (error) {
    console.error('[ComponentExtraction] Error:', error);
    return {
      success: false,
      components: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Default timeout for LLM extraction (2 minutes per screen)
const EXTRACTION_TIMEOUT_MS = 120000;

/**
 * Helper to create a timeout promise
 */
function createTimeout(ms: number, screenName: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Extraction timed out after ${ms / 1000}s for "${screenName}"`));
    }, ms);
  });
}

/**
 * Format milliseconds to human-readable string
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

/**
 * Extract components from multiple screens with progress callback
 */
export async function extractComponentsFromMultipleScreens(
  screens: Array<{
    id: string;
    name: string;
    html: string;
    thumbnail?: string;
  }>,
  options?: {
    provider?: 'anthropic' | 'openai' | 'google';
    model?: string;
    onProgress?: (progress: ExtractionProgress) => void;
    timeoutMs?: number;
  }
): Promise<{
  success: boolean;
  components: ExtractedComponentLLM[];
  errors: Array<{ screenId: string; error: string }>;
}> {
  const allComponents: ExtractedComponentLLM[] = [];
  const errors: Array<{ screenId: string; error: string }> = [];
  const startTime = Date.now();
  const screenTimes: number[] = [];
  const timeout = options?.timeoutMs || EXTRACTION_TIMEOUT_MS;

  console.log(`[ComponentExtraction] Starting extraction of ${screens.length} screens`);
  console.log(`[ComponentExtraction] Timeout per screen: ${timeout / 1000}s`);

  // Helper to report progress with timing info
  const reportProgress = (
    screenIndex: number,
    screenName: string,
    status: ExtractionProgress['status'],
    currentStep: ExtractionProgress['currentStep'],
    message: string,
    stepDetail?: string
  ) => {
    const elapsedMs = Date.now() - startTime;
    const screensCompleted = screenTimes.length;

    // Estimate remaining time based on average screen time
    let estimatedTotalMs: number | undefined;
    let estimatedRemainingMs: number | undefined;

    if (screensCompleted > 0) {
      const avgTimePerScreen = screenTimes.reduce((a, b) => a + b, 0) / screensCompleted;
      const remainingScreens = screens.length - screensCompleted;
      estimatedRemainingMs = Math.round(avgTimePerScreen * remainingScreens);
      estimatedTotalMs = elapsedMs + estimatedRemainingMs;
    }

    options?.onProgress?.({
      screenIndex,
      totalScreens: screens.length,
      screenName,
      status,
      message,
      startTime,
      elapsedMs,
      estimatedTotalMs,
      estimatedRemainingMs,
      screensCompleted,
      componentsFound: allComponents.length,
      currentStep,
      stepDetail,
    });
  };

  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];
    const screenStartTime = Date.now();

    console.log(`[ComponentExtraction] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[ComponentExtraction] Screen ${i + 1}/${screens.length}: "${screen.name}"`);
    console.log(`[ComponentExtraction] Screen ID: ${screen.id}`);
    console.log(`[ComponentExtraction] HTML size: ${(screen.html.length / 1024).toFixed(1)}KB`);

    // Step 1: Capture screenshot
    reportProgress(i, screen.name, 'capturing', 'screenshot',
      `Capturing screenshot for "${screen.name}"...`,
      'Rendering HTML to canvas'
    );

    let screenshot: string | undefined;
    try {
      console.log(`[ComponentExtraction] Step 1: Capturing screenshot...`);
      const captureStart = Date.now();

      const result = await captureHtmlScreenshot(screen.html, {
        maxWidth: 1280,
        maxHeight: 800,
        quality: 0.8,
        format: 'jpeg',
      });

      if (result) {
        console.log(`[ComponentExtraction] Screenshot captured in ${Date.now() - captureStart}ms`);
        console.log(`[ComponentExtraction] Original size: ${(result.base64.length / 1024).toFixed(1)}KB`);

        // Step 2: Compress screenshot
        reportProgress(i, screen.name, 'capturing', 'compress',
          `Compressing screenshot for "${screen.name}"...`,
          'Reducing image size for API'
        );

        const compressStart = Date.now();
        screenshot = await compressScreenshot(result.base64, 400);
        console.log(`[ComponentExtraction] Compressed to ${(screenshot.length / 1024).toFixed(1)}KB in ${Date.now() - compressStart}ms`);
      } else {
        console.warn(`[ComponentExtraction] Screenshot capture returned null`);
      }
    } catch (err) {
      console.error('[ComponentExtraction] Screenshot capture error:', err);
    }

    // Step 3: Call LLM API
    reportProgress(i, screen.name, 'extracting', 'upload',
      `Sending to AI for analysis...`,
      'Uploading screenshot and HTML'
    );

    console.log(`[ComponentExtraction] Step 2: Calling LLM API...`);
    const llmStart = Date.now();

    try {
      // Race between extraction and timeout
      const result = await Promise.race([
        extractComponentsFromScreen(
          screen.id,
          screen.html,
          screenshot,
          {
            provider: options?.provider,
            model: options?.model,
          }
        ),
        createTimeout(timeout, screen.name),
      ]);

      const llmDuration = Date.now() - llmStart;
      console.log(`[ComponentExtraction] LLM response received in ${formatDuration(llmDuration)}`);

      if (result.success) {
        allComponents.push(...result.components);
        const screenDuration = Date.now() - screenStartTime;
        screenTimes.push(screenDuration);

        console.log(`[ComponentExtraction] ✓ Extracted ${result.components.length} components`);
        console.log(`[ComponentExtraction] Provider: ${result.provider}, Model: ${result.model}`);
        console.log(`[ComponentExtraction] Screen completed in ${formatDuration(screenDuration)}`);

        reportProgress(i, screen.name, 'complete', 'done',
          `Extracted ${result.components.length} components from "${screen.name}" (${formatDuration(screenDuration)})`,
          `Found: ${result.components.map(c => c.category).join(', ')}`
        );
      } else {
        const screenDuration = Date.now() - screenStartTime;
        screenTimes.push(screenDuration);

        console.error(`[ComponentExtraction] ✗ Extraction failed: ${result.error}`);
        errors.push({ screenId: screen.id, error: result.error || 'Unknown error' });

        reportProgress(i, screen.name, 'error', 'done',
          `Error: ${result.error}`,
          `Failed after ${formatDuration(screenDuration)}`
        );
      }
    } catch (err) {
      const screenDuration = Date.now() - screenStartTime;
      screenTimes.push(screenDuration);

      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[ComponentExtraction] ✗ Exception: ${errorMsg}`);
      errors.push({ screenId: screen.id, error: errorMsg });

      reportProgress(i, screen.name, 'error', 'done',
        `Error: ${errorMsg}`,
        `Failed after ${formatDuration(screenDuration)}`
      );
    }
  }

  // Final summary
  const totalDuration = Date.now() - startTime;
  console.log(`[ComponentExtraction] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`[ComponentExtraction] EXTRACTION COMPLETE`);
  console.log(`[ComponentExtraction] Total time: ${formatDuration(totalDuration)}`);
  console.log(`[ComponentExtraction] Screens processed: ${screens.length}`);
  console.log(`[ComponentExtraction] Successful: ${screens.length - errors.length}`);
  console.log(`[ComponentExtraction] Failed: ${errors.length}`);
  console.log(`[ComponentExtraction] Components found: ${allComponents.length}`);

  // Deduplicate components by name + category
  const deduplicatedComponents = deduplicateComponents(allComponents);
  console.log(`[ComponentExtraction] After deduplication: ${deduplicatedComponents.length} unique components`);

  return {
    success: errors.length === 0,
    components: deduplicatedComponents,
    errors,
  };
}

/**
 * Deduplicate components across screens by merging similar ones
 */
function deduplicateComponents(
  components: ExtractedComponentLLM[]
): ExtractedComponentLLM[] {
  const componentMap = new Map<string, ExtractedComponentLLM>();

  for (const comp of components) {
    // Create a signature based on category and name similarity
    const signature = `${comp.category}:${normalizeComponentName(comp.name)}`;

    if (componentMap.has(signature)) {
      // Merge with existing
      const existing = componentMap.get(signature)!;
      existing.occurrences++;
      if (!existing.sourceScreenIds.includes(comp.sourceScreenId)) {
        existing.sourceScreenIds.push(comp.sourceScreenId);
      }
      // Merge variants
      if (comp.variants) {
        existing.variants = mergeVariants(existing.variants || [], comp.variants);
      }
    } else {
      componentMap.set(signature, { ...comp });
    }
  }

  // Sort by occurrences (most common first)
  return Array.from(componentMap.values()).sort(
    (a, b) => b.occurrences - a.occurrences
  );
}

/**
 * Normalize component name for deduplication
 */
function normalizeComponentName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);
}

/**
 * Merge variant arrays, avoiding duplicates
 */
function mergeVariants(
  existing: ComponentVariant[],
  newVariants: ComponentVariant[]
): ComponentVariant[] {
  const variantMap = new Map<string, ComponentVariant>();

  for (const v of existing) {
    variantMap.set(v.name.toLowerCase(), v);
  }
  for (const v of newVariants) {
    if (!variantMap.has(v.name.toLowerCase())) {
      variantMap.set(v.name.toLowerCase(), v);
    }
  }

  return Array.from(variantMap.values());
}

/**
 * Category display information
 */
export const CATEGORY_INFO: Record<
  ComponentCategory,
  { label: string; icon: string; color: string }
> = {
  button: { label: 'Buttons', icon: 'CursorClick', color: '#3b82f6' },
  input: { label: 'Inputs', icon: 'TextT', color: '#8b5cf6' },
  form: { label: 'Forms', icon: 'Textbox', color: '#ec4899' },
  card: { label: 'Cards', icon: 'Square', color: '#f59e0b' },
  navigation: { label: 'Navigation', icon: 'List', color: '#10b981' },
  header: { label: 'Headers', icon: 'TextHOne', color: '#06b6d4' },
  footer: { label: 'Footers', icon: 'TextAlignBottom', color: '#6366f1' },
  list: { label: 'Lists', icon: 'ListBullets', color: '#84cc16' },
  modal: { label: 'Modals', icon: 'FrameCorners', color: '#f43f5e' },
  image: { label: 'Images', icon: 'Image', color: '#14b8a6' },
  icon: { label: 'Icons', icon: 'Star', color: '#a855f7' },
  badge: { label: 'Badges', icon: 'Tag', color: '#0ea5e9' },
  alert: { label: 'Alerts', icon: 'Warning', color: '#ef4444' },
  dropdown: { label: 'Dropdowns', icon: 'CaretDown', color: '#64748b' },
  tabs: { label: 'Tabs', icon: 'Tabs', color: '#a855f7' },
  table: { label: 'Tables', icon: 'Table', color: '#64748b' },
  other: { label: 'Other', icon: 'Puzzle', color: '#9ca3af' },
};
