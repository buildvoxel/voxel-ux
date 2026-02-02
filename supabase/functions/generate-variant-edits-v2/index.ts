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

// API keys are now retrieved from user's vault via get_api_key RPC

// ============================================================================
// Prompt Building
// ============================================================================

function buildEditOperationsPrompt(plan: VariantPlan, elementSummary: string, hasScreenshot: boolean): string {
  // Safely handle potentially undefined fields
  const keyChanges = Array.isArray(plan?.keyChanges) ? plan.keyChanges : [];
  const keyChangesText = keyChanges.length > 0
    ? keyChanges.map((c, i) => `${i + 1}. ${c}`).join('\n')
    : '(No specific changes listed)';

  const title = plan?.title || 'Untitled Variant';
  const description = plan?.description || 'No description provided';
  const styleNotes = plan?.styleNotes || 'Match existing styles';

  const visionContext = hasScreenshot
    ? `\n## Visual Reference\nYou have been provided a screenshot of the current page. Use this to understand the visual layout, styling, and element positions. Match your edit operations to what you see in the screenshot.\n`
    : '';

  return `You are a UI/UX expert specializing in precise DOM manipulation. Your task is to generate EXACT edit operations to modify an existing web page.

CRITICAL: You are NOT regenerating the HTML. You are creating surgical edits that will be applied to the ORIGINAL HTML. The goal is to maintain UI consistency with the original design while implementing the variant changes.
${visionContext}
## Variant to Implement
**Title:** ${title}
**Description:** ${description}

**Key Changes Required:**
${keyChangesText}

**Style Notes:** ${styleNotes}

## Element Summary (DOM Structure)
This shows the current page structure with CSS selectors. Use ONLY selectors that appear in this summary:
\`\`\`
${elementSummary}
\`\`\`

## Available Edit Operations

Generate a JSON array of operations. Each operation MUST use a selector from the element summary above.

**Operation Types:**

1. \`updateText\` - Change text content of an element
   \`{"type": "updateText", "selector": "#main-title", "newText": "New Title", "description": "Update page heading"}\`

2. \`updateAttribute\` - Set/change an HTML attribute
   \`{"type": "updateAttribute", "selector": "img#hero-image", "attribute": "src", "value": "/new-image.png", "description": "Change hero image"}\`

3. \`updateStyle\` - Apply inline CSS styles (preserves existing styles not mentioned)
   \`{"type": "updateStyle", "selector": "button.primary", "styles": {"background-color": "#3B82F6", "border-radius": "8px"}, "description": "Update button styling"}\`

4. \`addClass\` - Add a CSS class
   \`{"type": "addClass", "selector": ".card", "className": "highlighted", "description": "Highlight the card"}\`

5. \`removeClass\` - Remove a CSS class
   \`{"type": "removeClass", "selector": ".alert", "className": "hidden", "description": "Show the alert"}\`

6. \`insertElement\` - Add new HTML element (positions: before, after, prepend, append)
   \`{"type": "insertElement", "selector": "nav.main-nav", "position": "append", "html": "<a href=\\"/new\\">New Link</a>", "description": "Add navigation item"}\`

7. \`removeElement\` - Delete an element from the page
   \`{"type": "removeElement", "selector": ".deprecated-banner", "description": "Remove old banner"}\`

8. \`replaceElement\` - Replace an element entirely with new HTML
   \`{"type": "replaceElement", "selector": ".old-widget", "html": "<div class=\\"new-widget\\">Updated content</div>", "description": "Replace widget"}\`

9. \`replaceInnerHtml\` - Replace only the inner content of an element
   \`{"type": "replaceInnerHtml", "selector": ".content-area", "html": "<p>New paragraph</p><p>Another paragraph</p>", "description": "Update content"}\`

## CRITICAL Rules

1. **ONLY use selectors from the element summary** - Do not invent selectors. Every selector MUST appear in the element summary above.
2. **Preserve the design system** - Use existing colors, fonts, and spacing from the original. Only change what the variant requires.
3. **Minimal changes** - Make the fewest operations necessary. Do NOT restyle elements that don't need changing.
4. **Be specific** - Prefer ID selectors (#id) over class selectors, prefer unique selectors over generic ones.
5. **Escape properly** - In JSON, escape quotes in HTML strings with backslash.
6. **Include descriptions** - Every operation MUST have a "description" field.
7. **Logical order** - Structure changes first, then content, then styling.

## Response Format

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "operations": [
    {"type": "updateText", "selector": "...", "newText": "...", "description": "..."},
    ...
  ],
  "summary": "Brief summary of all changes made"
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
    // Extract media type from data URL if present
    let mediaType = 'image/png'; // default
    let imageData = screenshotBase64;

    const dataUrlMatch = screenshotBase64.match(/^data:(image\/\w+);base64,/);
    if (dataUrlMatch) {
      mediaType = dataUrlMatch[1]; // e.g., 'image/jpeg' or 'image/png'
      imageData = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
    }

    console.log('[callAnthropic] Image media type:', mediaType, 'data length:', imageData.length);

    messages.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
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
    // Extract media type from data URL if present
    let mimeType = 'image/png'; // default
    let imageData = screenshotBase64;

    const dataUrlMatch = screenshotBase64.match(/^data:(image\/\w+);base64,/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      imageData = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
    }

    console.log('[callGoogle] Image mime type:', mimeType, 'data length:', imageData.length);

    parts.push({
      inlineData: {
        mimeType,
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
    // Step 1: Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Step 2: Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const jwt = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: `Unauthorized: ${userError?.message || 'Invalid token'}` }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.log('[generate-variant-edits-v2] User authenticated:', user.id);

    // Step 3: Parse request body
    console.log('[generate-variant-edits-v2] Step 3: Parsing request body...');
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

    // Step 4: Extract and validate fields
    console.log('[generate-variant-edits-v2] Step 4: Validating fields...');
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

    // Step 5: Get user's API key from vault
    console.log('[generate-variant-edits-v2] Step 5: Getting API key from vault...');
    const requestedProvider = provider || 'anthropic';

    // Query user's API key configuration
    let keyQuery = supabase
      .from('user_api_key_refs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (requestedProvider) {
      keyQuery = keyQuery.eq('provider', requestedProvider);
    }

    const { data: keyConfigs, error: keyError } = await keyQuery.limit(1);
    const keyConfig = keyConfigs?.[0];

    if (keyError || !keyConfig) {
      console.error('[generate-variant-edits-v2] No API key configured for user');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No API key configured. Please add your API key in Settings.',
          errorCode: 'API_KEY_MISSING',
          provider: requestedProvider,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const activeProvider = keyConfig.provider;
    const activeModel = model || keyConfig.model || 'claude-sonnet-4-20250514';
    console.log('[generate-variant-edits-v2] Using provider:', activeProvider, 'model:', activeModel);

    // Get decrypted API key from vault
    const { data: apiKey, error: decryptError } = await supabase
      .rpc('get_api_key', { p_user_id: user.id, p_provider: activeProvider });

    if (decryptError || !apiKey) {
      console.error('[generate-variant-edits-v2] Failed to retrieve API key:', decryptError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to retrieve API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 6: Generate operations for each plan
    console.log('[generate-variant-edits-v2] Step 6: Generating operations...');
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

      const prompt = buildEditOperationsPrompt(plan, elementSummary, !!screenshotBase64);
      console.log(`[generate-variant-edits-v2] Prompt length: ${prompt.length} chars, hasScreenshot: ${!!screenshotBase64}`);

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
