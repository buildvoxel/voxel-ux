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

    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

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
        Authorization: `Bearer ${session.access_token}`,
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
  }
): Promise<{
  success: boolean;
  components: ExtractedComponentLLM[];
  errors: Array<{ screenId: string; error: string }>;
}> {
  const allComponents: ExtractedComponentLLM[] = [];
  const errors: Array<{ screenId: string; error: string }> = [];

  for (let i = 0; i < screens.length; i++) {
    const screen = screens[i];

    // Report progress: capturing
    options?.onProgress?.({
      screenIndex: i,
      totalScreens: screens.length,
      screenName: screen.name,
      status: 'capturing',
      message: `Capturing screenshot for "${screen.name}"...`,
    });

    // Capture screenshot
    let screenshot: string | undefined;
    try {
      const result = await captureHtmlScreenshot(screen.html, {
        maxWidth: 1280,
        maxHeight: 800,
        quality: 0.8,
        format: 'jpeg',
      });

      if (result) {
        screenshot = await compressScreenshot(result.base64, 400);
      }
    } catch (err) {
      console.error('[ComponentExtraction] Screenshot capture error:', err);
    }

    // Report progress: extracting
    options?.onProgress?.({
      screenIndex: i,
      totalScreens: screens.length,
      screenName: screen.name,
      status: 'extracting',
      message: `Extracting components from "${screen.name}"...`,
    });

    // Extract components
    const result = await extractComponentsFromScreen(
      screen.id,
      screen.html,
      screenshot,
      {
        provider: options?.provider,
        model: options?.model,
      }
    );

    if (result.success) {
      allComponents.push(...result.components);
      options?.onProgress?.({
        screenIndex: i,
        totalScreens: screens.length,
        screenName: screen.name,
        status: 'complete',
        message: `Extracted ${result.components.length} components from "${screen.name}"`,
      });
    } else {
      errors.push({ screenId: screen.id, error: result.error || 'Unknown error' });
      options?.onProgress?.({
        screenIndex: i,
        totalScreens: screens.length,
        screenName: screen.name,
        status: 'error',
        message: `Error extracting from "${screen.name}": ${result.error}`,
      });
    }
  }

  // Deduplicate components by name + category
  const deduplicatedComponents = deduplicateComponents(allComponents);

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
