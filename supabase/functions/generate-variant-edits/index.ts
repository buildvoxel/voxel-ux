/**
 * Generate Variant Edits Edge Function
 *
 * Instead of generating complete HTML, this returns edit operations
 * that can be applied to the original HTML. This is:
 * - Much faster (fewer tokens)
 * - More consistent (preserves original structure)
 * - Easier to review and iterate
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VariantPlan {
  id: string;
  variantIndex: number;
  title: string;
  description: string;
  keyChanges: string[];
  styleNotes: string;
}

interface EditOperation {
  find: string;
  replace: string;
  description?: string;
}

interface VariantEdits {
  variantIndex: number;
  planId: string;
  edits: EditOperation[];
  summary: string;
}

interface RequestBody {
  sessionId: string;
  plans: VariantPlan[];
  originalHtml: string;
  screenshotBase64?: string;
  uiMetadata?: Record<string, unknown>;
  provider?: string;
  model?: string;
}

// Get API keys from environment
function getApiKey(provider: string): string | null {
  switch (provider) {
    case 'anthropic':
      return Deno.env.get('ANTHROPIC_API_KEY') || null;
    case 'openai':
      return Deno.env.get('OPENAI_API_KEY') || null;
    case 'google':
      return Deno.env.get('GOOGLE_API_KEY') || null;
    default:
      return null;
  }
}

// Determine best available provider
function getBestProvider(): { provider: string; model: string } | null {
  if (Deno.env.get('ANTHROPIC_API_KEY')) {
    return { provider: 'anthropic', model: 'claude-sonnet-4-20250514' };
  }
  if (Deno.env.get('OPENAI_API_KEY')) {
    return { provider: 'openai', model: 'gpt-4o' };
  }
  if (Deno.env.get('GOOGLE_API_KEY')) {
    return { provider: 'google', model: 'gemini-1.5-pro' };
  }
  return null;
}

// Build the prompt for generating edits
function buildEditsPrompt(plan: VariantPlan, originalHtml: string): string {
  return `You are a UI/UX expert tasked with modifying an existing HTML page to implement a specific design variant.

## Your Task
Generate a list of FIND/REPLACE edit operations that will transform the original HTML to implement this variant:

**Variant: ${plan.title}**
${plan.description}

**Key Changes Required:**
${plan.keyChanges.map((c, i) => `${i + 1}. ${c}`).join('\n')}

**Style Notes:** ${plan.styleNotes || 'Match existing styles'}

## Rules for Generating Edits

1. **Minimal Changes**: Only modify what's necessary to implement the variant. Keep the rest identical.

2. **Exact Matches**: The "find" string must exist EXACTLY in the original HTML (including whitespace).

3. **Complete Elements**: When replacing, include complete HTML elements. Don't break tags.

4. **Preserve Structure**: Maintain the overall page structure. Only add/modify/remove specific elements.

5. **Include Styles**: If adding new elements, include inline styles or add to existing <style> blocks.

6. **Be Specific**: Use unique strings for "find" to avoid accidental multiple replacements.

7. **Order Matters**: List edits in the order they should be applied (top to bottom of document).

## Response Format

Return a JSON object with this exact structure:
{
  "edits": [
    {
      "find": "exact string to find in original HTML",
      "replace": "replacement string",
      "description": "brief description of what this edit does"
    }
  ],
  "summary": "one sentence describing the overall changes"
}

## Original HTML (analyze this carefully):
\`\`\`html
${originalHtml.substring(0, 50000)}
\`\`\`

Generate the edit operations now. Return ONLY valid JSON, no markdown formatting.`;
}

// Call Anthropic API
async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): Promise<{ edits: EditOperation[]; summary: string }> {
  const messages: Array<{ role: string; content: unknown }> = [];

  if (screenshotBase64) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: screenshotBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
        },
        {
          type: 'text',
          text: prompt,
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: prompt });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  return JSON.parse(jsonMatch[0]);
}

// Call OpenAI API
async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): Promise<{ edits: EditOperation[]; summary: string }> {
  const messages: Array<{ role: string; content: unknown }> = [];

  if (screenshotBase64) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: screenshotBase64.startsWith('data:')
              ? screenshotBase64
              : `data:image/png;base64,${screenshotBase64}`,
          },
        },
        {
          type: 'text',
          text: prompt,
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: prompt });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  return JSON.parse(content);
}

// Call Google API
async function callGoogle(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): Promise<{ edits: EditOperation[]; summary: string }> {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  if (screenshotBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: screenshotBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
  }

  parts.push({ text: prompt });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: 8000,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  return JSON.parse(jsonMatch[0]);
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { sessionId, plans, originalHtml, screenshotBase64, provider, model } = body;

    console.log('[generate-variant-edits] Starting:', {
      sessionId,
      plansCount: plans.length,
      htmlLength: originalHtml.length,
      hasScreenshot: !!screenshotBase64,
    });

    // Determine provider
    let activeProvider = provider;
    let activeModel = model;

    if (!activeProvider || !activeModel) {
      const best = getBestProvider();
      if (!best) {
        throw new Error('No API keys configured');
      }
      activeProvider = best.provider;
      activeModel = best.model;
    }

    const apiKey = getApiKey(activeProvider);
    if (!apiKey) {
      throw new Error(`No API key for provider: ${activeProvider}`);
    }

    console.log('[generate-variant-edits] Using provider:', activeProvider, activeModel);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate edits for each plan
    const results: VariantEdits[] = [];
    const startTime = Date.now();

    for (const plan of plans) {
      console.log(`[generate-variant-edits] Generating edits for variant ${plan.variantIndex}...`);

      const prompt = buildEditsPrompt(plan, originalHtml);

      let editsResult: { edits: EditOperation[]; summary: string };

      switch (activeProvider) {
        case 'anthropic':
          editsResult = await callAnthropic(apiKey, activeModel, prompt, screenshotBase64);
          break;
        case 'openai':
          editsResult = await callOpenAI(apiKey, activeModel, prompt, screenshotBase64);
          break;
        case 'google':
          editsResult = await callGoogle(apiKey, activeModel, prompt, screenshotBase64);
          break;
        default:
          throw new Error(`Unknown provider: ${activeProvider}`);
      }

      console.log(`[generate-variant-edits] Variant ${plan.variantIndex}: ${editsResult.edits.length} edits`);

      results.push({
        variantIndex: plan.variantIndex,
        planId: plan.id,
        edits: editsResult.edits,
        summary: editsResult.summary,
      });

      // Store edits in database for the variant plan
      await supabase
        .from('vibe_variant_plans')
        .update({
          edit_operations: editsResult.edits,
          edit_summary: editsResult.summary,
        })
        .eq('id', plan.id);
    }

    const durationMs = Date.now() - startTime;
    console.log(`[generate-variant-edits] Complete in ${durationMs}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        variantEdits: results,
        provider: activeProvider,
        model: activeModel,
        durationMs,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[generate-variant-edits] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
