/**
 * Generate Variant Edits V2 Edge Function
 *
 * Uses element summary instead of full HTML to generate edit operations.
 * This approach:
 * - Stays within context limits (no full HTML)
 * - Produces structured, typed operations
 * - Is more reliable than find/replace strings
 */

// Use npm imports for better compatibility
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
  elementSummary: string;
  screenshotBase64?: string;
  provider?: string;
  model?: string;
}

// ============================================================================
// API Key Management
// ============================================================================

function getApiKey(provider: string): string | null {
  try {
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
  } catch (e) {
    console.error('[getApiKey] Error accessing env:', e);
    return null;
  }
}

function getBestProvider(): { provider: string; model: string } | null {
  try {
    if (Deno.env.get('ANTHROPIC_API_KEY')) {
      return { provider: 'anthropic', model: 'claude-sonnet-4-20250514' };
    }
    if (Deno.env.get('OPENAI_API_KEY')) {
      return { provider: 'openai', model: 'gpt-4o' };
    }
    if (Deno.env.get('GOOGLE_API_KEY')) {
      return { provider: 'google', model: 'gemini-1.5-pro' };
    }
  } catch (e) {
    console.error('[getBestProvider] Error accessing env:', e);
  }
  return null;
}

// ============================================================================
// Prompt Building
// ============================================================================

function buildEditOperationsPrompt(plan: VariantPlan, elementSummary: string): string {
  // Safely handle potentially undefined fields
  const keyChanges = Array.isArray(plan?.keyChanges) ? plan.keyChanges : [];
  const keyChangesText = keyChanges.length > 0
    ? keyChanges.map((c, i) => `${i + 1}. ${c}`).join('\n')
    : '(No specific changes listed)';

  const title = plan?.title || 'Untitled Variant';
  const description = plan?.description || 'No description provided';
  const styleNotes = plan?.styleNotes || 'Match existing styles';

  return `You are a UI/UX expert. Generate edit operations to transform a web page to implement a design variant.

## Variant to Implement
**Title:** ${title}
**Description:** ${description}

**Key Changes Required:**
${keyChangesText}

**Style Notes:** ${styleNotes}

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
  console.log('[callAnthropic] Starting API call...');

  const messages: Array<{ role: string; content: unknown }> = [];

  if (screenshotBase64) {
    const imageData = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: imageData,
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
    const errorText = await response.text();
    console.error('[callAnthropic] API error:', response.status, errorText);
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[callAnthropic] Response received');

  const content = data.content?.[0]?.text || '';
  if (!content) {
    throw new Error('Empty response from Anthropic');
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[callAnthropic] No JSON found in response:', content.substring(0, 500));
    throw new Error('No valid JSON found in response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('[callAnthropic] JSON parse error:', parseError);
    throw new Error('Failed to parse JSON from response');
  }
}

async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): Promise<{ operations: EditOperation[]; summary: string }> {
  console.log('[callOpenAI] Starting API call...');

  const messages: Array<{ role: string; content: unknown }> = [];

  if (screenshotBase64) {
    const imageUrl = screenshotBase64.startsWith('data:')
      ? screenshotBase64
      : `data:image/png;base64,${screenshotBase64}`;
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: imageUrl },
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
    const errorText = await response.text();
    console.error('[callOpenAI] API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[callOpenAI] Response received');

  const content = data.choices?.[0]?.message?.content || '';
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('[callOpenAI] JSON parse error:', parseError);
    throw new Error('Failed to parse JSON from response');
  }
}

async function callGoogle(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): Promise<{ operations: EditOperation[]; summary: string }> {
  console.log('[callGoogle] Starting API call...');

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  if (screenshotBase64) {
    const imageData = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: imageData,
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
    const errorText = await response.text();
    console.error('[callGoogle] API error:', response.status, errorText);
    throw new Error(`Google API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[callGoogle] Response received');

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!content) {
    throw new Error('Empty response from Google');
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[callGoogle] No JSON found in response:', content.substring(0, 500));
    throw new Error('No valid JSON found in response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('[callGoogle] JSON parse error:', parseError);
    throw new Error('Failed to parse JSON from response');
  }
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req) => {
  console.log('[generate-variant-edits-v2] ===== REQUEST START =====');
  console.log('[generate-variant-edits-v2] Method:', req.method);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[generate-variant-edits-v2] Handling OPTIONS preflight');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Step 1: Parse request body
    console.log('[generate-variant-edits-v2] Step 1: Parsing request body...');
    let body: RequestBody;
    try {
      const rawBody = await req.text();
      console.log('[generate-variant-edits-v2] Raw body length:', rawBody.length);
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('[generate-variant-edits-v2] Failed to parse body:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Extract and validate fields
    console.log('[generate-variant-edits-v2] Step 2: Validating fields...');
    const { sessionId, plans, elementSummary, screenshotBase64, provider, model } = body;

    // Validate required fields
    if (!sessionId) {
      console.error('[generate-variant-edits-v2] Missing sessionId');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!elementSummary) {
      console.error('[generate-variant-edits-v2] Missing elementSummary');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing elementSummary' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate plans is an array
    if (!Array.isArray(plans)) {
      console.error('[generate-variant-edits-v2] plans is not an array:', typeof plans);
      return new Response(
        JSON.stringify({ success: false, error: 'plans must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (plans.length === 0) {
      console.error('[generate-variant-edits-v2] plans array is empty');
      return new Response(
        JSON.stringify({ success: false, error: 'plans array is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-variant-edits-v2] Validated:', {
      sessionId,
      plansCount: plans.length,
      summaryLength: elementSummary.length,
      hasScreenshot: !!screenshotBase64,
    });

    // Step 3: Determine provider
    console.log('[generate-variant-edits-v2] Step 3: Determining provider...');
    let activeProvider = provider;
    let activeModel = model;

    if (!activeProvider || !activeModel) {
      const best = getBestProvider();
      if (!best) {
        console.error('[generate-variant-edits-v2] No API keys configured');
        return new Response(
          JSON.stringify({ success: false, error: 'No API keys configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      activeProvider = best.provider;
      activeModel = best.model;
    }

    const apiKey = getApiKey(activeProvider);
    if (!apiKey) {
      console.error('[generate-variant-edits-v2] No API key for provider:', activeProvider);
      return new Response(
        JSON.stringify({ success: false, error: `No API key for provider: ${activeProvider}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-variant-edits-v2] Using provider:', activeProvider, activeModel);

    // Step 4: Initialize Supabase client
    console.log('[generate-variant-edits-v2] Step 4: Initializing Supabase...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[generate-variant-edits-v2] Missing Supabase env vars');
      // Continue without saving to DB - still generate the edits
    }

    const supabase = supabaseUrl && supabaseKey
      ? createClient(supabaseUrl, supabaseKey)
      : null;

    // Step 5: Generate operations for each plan
    console.log('[generate-variant-edits-v2] Step 5: Generating operations...');
    const results: VariantEdits[] = [];
    const startTime = Date.now();

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      console.log(`[generate-variant-edits-v2] Processing plan ${i + 1}/${plans.length}:`, {
        id: plan?.id,
        variantIndex: plan?.variantIndex,
        title: plan?.title,
      });

      // Validate plan has required fields
      if (!plan?.id || plan?.variantIndex === undefined) {
        console.warn(`[generate-variant-edits-v2] Skipping invalid plan at index ${i}`);
        continue;
      }

      const prompt = buildEditOperationsPrompt(plan, elementSummary);
      console.log(`[generate-variant-edits-v2] Prompt length: ${prompt.length} chars`);

      let editsResult: { operations: EditOperation[]; summary: string };

      try {
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
      } catch (llmError) {
        console.error(`[generate-variant-edits-v2] LLM error for variant ${plan.variantIndex}:`, llmError);
        // Return error with details
        return new Response(
          JSON.stringify({
            success: false,
            error: `LLM API call failed: ${llmError instanceof Error ? llmError.message : String(llmError)}`,
            provider: activeProvider,
            model: activeModel,
            variantIndex: plan.variantIndex,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[generate-variant-edits-v2] Variant ${plan.variantIndex}: ${editsResult.operations?.length || 0} operations`);

      const operations = Array.isArray(editsResult.operations) ? editsResult.operations : [];
      const summary = editsResult.summary || '';

      results.push({
        variantIndex: plan.variantIndex,
        planId: plan.id,
        operations,
        summary,
      });

      // Store operations in database (if Supabase is available)
      if (supabase) {
        try {
          await supabase
            .from('vibe_variant_plans')
            .update({
              edit_operations: operations,
              edit_summary: summary,
            })
            .eq('id', plan.id);
          console.log(`[generate-variant-edits-v2] Saved operations for plan ${plan.id}`);
        } catch (dbError) {
          console.warn(`[generate-variant-edits-v2] Failed to save to DB:`, dbError);
          // Continue even if DB save fails
        }
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(`[generate-variant-edits-v2] ===== COMPLETE in ${durationMs}ms =====`);

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
    console.error('[generate-variant-edits-v2] Unhandled error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        stack: errorStack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
