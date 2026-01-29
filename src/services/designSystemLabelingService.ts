/**
 * Design System Labeling Service
 * Uses LLM APIs to generate semantic labels for colors and fonts
 */

import { getLLMConfigAsync, type LLMConfig } from './llmService';

export interface ColorToLabel {
  hex: string;
  usage: 'background' | 'text' | 'border' | 'accent';
}

export interface FontToLabel {
  family: string;
  weights: string[];
}

export interface LabeledColor {
  hex: string;
  label: string;
  semanticRole: string;
}

export interface LabeledFont {
  family: string;
  label: string;
  category: string;
}

const COLOR_LABELING_PROMPT = `You are a design system expert. Given a list of colors with their usage context, provide semantic labels for each.

For each color, provide:
1. A short descriptive label (2-4 words) that describes what this color represents in a UI
2. A semantic role (primary, secondary, accent, neutral, success, warning, error, info, or custom)

Respond with ONLY valid JSON in this exact format:
{
  "colors": [
    { "hex": "#...", "label": "Primary Action Blue", "semanticRole": "primary" }
  ]
}

Colors to label:
`;

const FONT_LABELING_PROMPT = `You are a typography expert. Given a list of font families, provide semantic labels for each.

For each font, provide:
1. A short descriptive label (2-4 words) that describes its purpose in a design system
2. A category (display, heading, body, ui, code, or decorative)

Respond with ONLY valid JSON in this exact format:
{
  "fonts": [
    { "family": "Inter", "label": "Primary UI Font", "category": "ui" }
  ]
}

Fonts to label:
`;

/**
 * Make direct API call to LLM provider
 */
async function callLLMDirect(config: LLMConfig, prompt: string): Promise<string> {
  const systemPrompt = 'You are a design system expert. Respond only with valid JSON, no markdown.';

  if (config.provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: config.model || 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  if (config.provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o',
        max_tokens: 2048,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  if (config.provider === 'google') {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-1.5-pro'}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\n' + prompt }] }],
          generationConfig: { maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}

/**
 * Parse JSON response, handling markdown code blocks
 */
function parseJsonResponse(text: string): unknown {
  let cleaned = text.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return JSON.parse(cleaned.trim());
}

/**
 * Generate semantic labels for colors using LLM
 */
export async function labelColorsWithLLM(colors: ColorToLabel[]): Promise<LabeledColor[]> {
  const config = await getLLMConfigAsync();

  if (!config) {
    console.log('[DesignSystem] No LLM config available, using fallback labels');
    return colors.map((c) => ({
      hex: c.hex,
      label: `${c.usage.charAt(0).toUpperCase() + c.usage.slice(1)} Color`,
      semanticRole: 'custom',
    }));
  }

  try {
    const colorList = colors
      .map((c) => `- ${c.hex} (used as ${c.usage})`)
      .join('\n');

    const prompt = COLOR_LABELING_PROMPT + colorList;
    const response = await callLLMDirect(config, prompt);
    const parsed = parseJsonResponse(response) as { colors: LabeledColor[] };

    if (!parsed.colors || !Array.isArray(parsed.colors)) {
      throw new Error('Invalid response format');
    }

    // Map back to our color list
    return colors.map((c) => {
      const labeled = parsed.colors.find(
        (lc) => lc.hex.toLowerCase() === c.hex.toLowerCase()
      );
      return {
        hex: c.hex,
        label: labeled?.label || `${c.usage.charAt(0).toUpperCase() + c.usage.slice(1)} Color`,
        semanticRole: labeled?.semanticRole || 'custom',
      };
    });
  } catch (error) {
    console.error('[DesignSystem] LLM labeling failed:', error);
    // Return fallback labels
    return colors.map((c) => ({
      hex: c.hex,
      label: `${c.usage.charAt(0).toUpperCase() + c.usage.slice(1)} Color`,
      semanticRole: 'custom',
    }));
  }
}

/**
 * Generate semantic labels for fonts using LLM
 */
export async function labelFontsWithLLM(fonts: FontToLabel[]): Promise<LabeledFont[]> {
  const config = await getLLMConfigAsync();

  if (!config) {
    console.log('[DesignSystem] No LLM config available, using fallback labels');
    return fonts.map((f) => ({
      family: f.family,
      label: 'UI Font',
      category: 'body',
    }));
  }

  try {
    const fontList = fonts
      .map((f) => `- ${f.family} (weights: ${f.weights.join(', ') || 'unknown'})`)
      .join('\n');

    const prompt = FONT_LABELING_PROMPT + fontList;
    const response = await callLLMDirect(config, prompt);
    const parsed = parseJsonResponse(response) as { fonts: LabeledFont[] };

    if (!parsed.fonts || !Array.isArray(parsed.fonts)) {
      throw new Error('Invalid response format');
    }

    // Map back to our font list
    return fonts.map((f) => {
      const labeled = parsed.fonts.find(
        (lf) => lf.family.toLowerCase() === f.family.toLowerCase()
      );
      return {
        family: f.family,
        label: labeled?.label || 'UI Font',
        category: labeled?.category || 'body',
      };
    });
  } catch (error) {
    console.error('[DesignSystem] LLM font labeling failed:', error);
    // Return fallback labels
    return fonts.map((f) => ({
      family: f.family,
      label: 'UI Font',
      category: 'body',
    }));
  }
}

/**
 * Check if LLM labeling is available
 */
export async function isLLMLabelingAvailable(): Promise<boolean> {
  const config = await getLLMConfigAsync();
  return config !== null;
}
