/**
 * Generate Variant Edits V2 Edge Function
 *
 * Uses element summary instead of full HTML to generate edit operations.
 * This approach:
 * - Stays within context limits (no full HTML)
 * - Produces structured, typed operations
 * - Is more reliable than find/replace strings
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// Types
// ============================================================================

interface VariantPlan {
  id: string;
  variantIndex: number;
  title: string;
  description: string;
  keyChanges: string[];
  styleNotes: string;
}

interface EditOperation {
  type: string;
  selector: string;
  description?: string;
  // Type-specific fields
  newText?: string;
  attribute?: string;
  value?: string;
  styles?: Record<string, string>;
  className?: string;
  position?: string;
  html?: string;
  targetSelector?: string;
  wrapperHtml?: string;
}

interface VariantEdits {
  variantIndex: number;
  planId: string;
  operations: EditOperation[];
  summary: string;
}

interface RequestBody {
  sessionId: string;
  plans: VariantPlan[];
  elementSummary: string; // Compact tree representation
  screenshotBase64?: string;
  provider?: string;
  model?: string;
}

// ============================================================================
// API Key Management
// ============================================================================

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

// ============================================================================
// Prompt Building
// ============================================================================

function buildEditOperationsPrompt(plan: VariantPlan, elementSummary: string): string {
  // Safely handle potentially undefined fields
  const keyChanges = Array.isArray(plan.keyChanges) ? plan.keyChanges : [];
  const keyChangesText = keyChanges.length > 0
    ? keyChanges.map((c, i) => `${i + 1}. ${c}`).join('\n')
    : '(No specific changes listed)';

  return `You are a UI/UX expert. Generate edit operations to transform a web page to implement a design variant.

## Variant to Implement
**Title:** ${plan.title || 'Untitled Variant'}
**Description:** ${plan.description || 'No description provided'}

**Key Changes Required:**
${keyChangesText}

**Style Notes:** ${plan.styleNotes || 'Match existing styles'}

## Element Summary
This is a compact representation of the current page structure:
\`\`\`
${elementSummary}
\`\`\`

## Available Edit Operations

Generate a JSON array of operations. Each operation has a \`type\` and \`selector\` (CSS selector).

**Operation Types:**

1. \`updateText\` - Change text content
   \`{"type": "updateText", "selector": ".title", "newText": "New Title"}\`

2. \`updateAttribute\` - Set/change an attribute
   \`{"type": "updateAttribute", "selector": "img.logo", "attribute": "src", "value": "/new-logo.png"}\`

3. \`updateStyle\` - Change inline styles
   \`{"type": "updateStyle", "selector": ".button", "styles": {"background-color": "#3B82F6", "color": "white"}}\`

4. \`addClass\` / \`removeClass\` - Modify classes
   \`{"type": "addClass", "selector": ".card", "className": "highlighted"}\`

5. \`insertElement\` - Add new element (before/after/prepend/append)
   \`{"type": "insertElement", "selector": ".nav", "position": "append", "html": "<li>New Item</li>"}\`

6. \`removeElement\` - Delete an element
   \`{"type": "removeElement", "selector": ".old-banner"}\`

7. \`replaceElement\` - Replace entire element
   \`{"type": "replaceElement", "selector": ".old-card", "html": "<div class='new-card'>...</div>"}\`

8. \`replaceInnerHtml\` - Replace element's contents
   \`{"type": "replaceInnerHtml", "selector": ".content", "html": "<p>New content</p>"}\`

## Rules

1. **Use specific selectors** - Prefer IDs (#id) and unique classes (.class-name) over generic tags
2. **Minimal changes** - Only modify what's necessary for the variant
3. **Include descriptions** - Add a "description" field explaining each change
4. **Order matters** - List operations in logical order (structure first, then content, then styling)
5. **Valid CSS selectors** - Ensure selectors are valid and match elements in the summary

## Response Format

Return ONLY a valid JSON object:
{
  "operations": [
    {"type": "...", "selector": "...", "description": "...", ...},
    ...
  ],
  "summary": "One sentence describing the overall changes"
}`;
}

// ============================================================================
// LLM API Calls
// ============================================================================

async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): Promise<{ operations: EditOperation[]; summary: string }> {
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
      max_tokens: 4000,
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

async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): Promise<{ operations: EditOperation[]; summary: string }> {
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
      max_tokens: 4000,
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

async function callGoogle(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): Promise<{ operations: EditOperation[]; summary: string }> {
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
          maxOutputTokens: 4000,
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

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req) => {
  console.log('[generate-variant-edits-v2] Request received:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[generate-variant-edits-v2] Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, plans, elementSummary, screenshotBase64, provider, model } = body;

    // Validate required fields
    if (!sessionId || !plans || !elementSummary) {
      console.error('[generate-variant-edits-v2] Missing required fields:', {
        hasSessionId: !!sessionId,
        hasPlans: !!plans,
        hasElementSummary: !!elementSummary
      });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: sessionId, plans, or elementSummary' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-variant-edits-v2] Starting:', {
      sessionId,
      plansCount: plans?.length || 0,
      summaryLength: elementSummary?.length || 0,
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

    console.log('[generate-variant-edits-v2] Using provider:', activeProvider, activeModel);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate operations for each plan
    const results: VariantEdits[] = [];
    const startTime = Date.now();

    for (const plan of plans) {
      console.log(`[generate-variant-edits-v2] Generating operations for variant ${plan.variantIndex}...`);
      console.log(`[generate-variant-edits-v2] Plan details:`, JSON.stringify({
        id: plan.id,
        variantIndex: plan.variantIndex,
        title: plan.title,
        hasKeyChanges: Array.isArray(plan.keyChanges),
        keyChangesCount: Array.isArray(plan.keyChanges) ? plan.keyChanges.length : 0,
      }));

      const prompt = buildEditOperationsPrompt(plan, elementSummary);
      console.log(`[generate-variant-edits-v2] Prompt length: ${prompt.length} chars`);

      let editsResult: { operations: EditOperation[]; summary: string };

      try {
        switch (activeProvider) {
          case 'anthropic':
            console.log('[generate-variant-edits-v2] Calling Anthropic API...');
            editsResult = await callAnthropic(apiKey, activeModel, prompt, screenshotBase64);
            break;
          case 'openai':
            console.log('[generate-variant-edits-v2] Calling OpenAI API...');
            editsResult = await callOpenAI(apiKey, activeModel, prompt, screenshotBase64);
            break;
          case 'google':
            console.log('[generate-variant-edits-v2] Calling Google API...');
            editsResult = await callGoogle(apiKey, activeModel, prompt, screenshotBase64);
            break;
          default:
            throw new Error(`Unknown provider: ${activeProvider}`);
        }
      } catch (llmError) {
        console.error(`[generate-variant-edits-v2] LLM call failed for variant ${plan.variantIndex}:`, llmError);
        throw new Error(`LLM API call failed: ${llmError.message || String(llmError)}`);
      }

      console.log(`[generate-variant-edits-v2] Variant ${plan.variantIndex}: ${editsResult.operations?.length || 0} operations`);

      results.push({
        variantIndex: plan.variantIndex,
        planId: plan.id,
        operations: editsResult.operations || [],
        summary: editsResult.summary || '',
      });

      // Store operations in database
      await supabase
        .from('vibe_variant_plans')
        .update({
          edit_operations: editsResult.operations,
          edit_summary: editsResult.summary,
        })
        .eq('id', plan.id);
    }

    const durationMs = Date.now() - startTime;
    console.log(`[generate-variant-edits-v2] Complete in ${durationMs}ms`);

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
    console.error('[generate-variant-edits-v2] Error:', error);
    console.error('[generate-variant-edits-v2] Stack:', error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error),
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
