// Supabase Edge Function for generating visual HTML wireframes
// Creates sketch-style wireframes with hand-drawn aesthetic
// Deploy with: supabase functions deploy generate-visual-wireframes

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateVisualWireframesRequest {
  sessionId: string
  plans: Array<{
    id: string
    variantIndex: number
    title: string
    description: string
    keyChanges: string[]
    styleNotes: string
  }>
  compactedHtml: string
  uiMetadata?: {
    colors: Record<string, string[]>
    typography: Record<string, string[]>
    layout: Record<string, string[]>
    components: Array<{ type: string; count: number }>
  }
  selectedVariants?: number[]
  provider?: 'anthropic' | 'openai' | 'google'
  model?: string
}

interface VisualWireframeResult {
  variantIndex: number
  planId: string
  wireframeHtml: string
  wireframePath: string
  wireframeUrl: string
}

// Hand-drawn sketch CSS styles
const SKETCH_STYLES = `
<style>
  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe Print', 'Bradley Hand', 'Chilanka', 'TSCu_Comic', cursive, sans-serif;
    background: #fafafa;
    margin: 0;
    padding: 16px;
    color: #333;
  }

  .wireframe-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .sketch-box {
    border: 2px solid #444;
    border-radius: 3px;
    background: white;
    position: relative;
    /* Hand-drawn effect using box-shadow */
    box-shadow:
      2px 2px 0 #ddd,
      inset 0 0 0 1px rgba(0,0,0,0.05);
  }

  .sketch-box::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border: 1px solid transparent;
    border-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='none' stroke='%23666' stroke-width='2' stroke-dasharray='5,3' width='98' height='98' x='1' y='1' rx='3'/%3E%3C/svg%3E") 10 round;
    pointer-events: none;
  }

  .sketch-header {
    background: linear-gradient(to bottom, #f5f5f5, #e8e8e8);
    padding: 12px 16px;
    border-bottom: 2px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sketch-logo {
    width: 32px;
    height: 32px;
    background: #ddd;
    border: 2px solid #999;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #666;
  }

  .sketch-nav {
    display: flex;
    gap: 12px;
  }

  .sketch-nav-item {
    padding: 6px 12px;
    background: #e8e8e8;
    border: 1px dashed #aaa;
    border-radius: 3px;
    font-size: 12px;
    color: #555;
  }

  .sketch-button {
    padding: 8px 16px;
    background: linear-gradient(to bottom, #666, #444);
    color: white;
    border: 2px solid #333;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 2px 2px 0 #999;
  }

  .sketch-button-outline {
    padding: 8px 16px;
    background: white;
    color: #555;
    border: 2px dashed #888;
    border-radius: 4px;
    font-size: 12px;
  }

  .sketch-hero {
    padding: 48px 24px;
    text-align: center;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0,0,0,0.02) 10px,
      rgba(0,0,0,0.02) 20px
    );
    border-bottom: 2px dashed #ccc;
  }

  .sketch-heading {
    font-size: 28px;
    color: #333;
    margin: 0 0 12px 0;
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: #aaa;
    text-underline-offset: 6px;
  }

  .sketch-subheading {
    font-size: 16px;
    color: #666;
    margin: 0 0 24px 0;
  }

  .sketch-text-block {
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 8px,
      #ddd 8px,
      #ddd 9px
    );
    padding: 8px;
    min-height: 40px;
    border: 1px dashed #bbb;
    border-radius: 2px;
    color: #888;
    font-size: 12px;
  }

  .sketch-image-placeholder {
    background: #e0e0e0;
    border: 2px dashed #aaa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    font-size: 14px;
    position: relative;
    overflow: hidden;
  }

  .sketch-image-placeholder::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, transparent 60%),
      linear-gradient(-45deg, transparent 40%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, transparent 60%);
    background-size: 20px 20px;
  }

  .sketch-image-placeholder span {
    position: relative;
    z-index: 1;
    background: rgba(255,255,255,0.8);
    padding: 4px 8px;
    border-radius: 2px;
  }

  .sketch-card {
    border: 2px solid #bbb;
    border-radius: 6px;
    background: white;
    overflow: hidden;
    box-shadow: 3px 3px 0 #ddd;
  }

  .sketch-card-image {
    height: 120px;
    background: #e8e8e8;
    border-bottom: 2px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }

  .sketch-card-content {
    padding: 12px;
  }

  .sketch-card-title {
    font-size: 14px;
    font-weight: bold;
    color: #444;
    margin: 0 0 8px 0;
    border-bottom: 1px solid #ddd;
    padding-bottom: 4px;
  }

  .sketch-input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #bbb;
    border-radius: 4px;
    background: #fafafa;
    font-size: 13px;
    color: #888;
  }

  .sketch-section {
    padding: 32px 24px;
    border-bottom: 2px dashed #ddd;
  }

  .sketch-grid {
    display: grid;
    gap: 16px;
  }

  .sketch-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .sketch-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .sketch-grid-4 { grid-template-columns: repeat(4, 1fr); }

  .sketch-sidebar {
    width: 240px;
    background: #f0f0f0;
    border-right: 2px dashed #ccc;
    padding: 16px;
  }

  .sketch-sidebar-item {
    padding: 8px 12px;
    margin-bottom: 8px;
    background: white;
    border: 1px dashed #bbb;
    border-radius: 3px;
    font-size: 12px;
    color: #555;
  }

  .sketch-footer {
    padding: 24px;
    background: #f0f0f0;
    border-top: 2px solid #ddd;
    text-align: center;
    color: #888;
    font-size: 12px;
  }

  .sketch-flex {
    display: flex;
  }

  .sketch-flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sketch-gap-8 { gap: 8px; }
  .sketch-gap-16 { gap: 16px; }
  .sketch-gap-24 { gap: 24px; }

  .sketch-p-16 { padding: 16px; }
  .sketch-p-24 { padding: 24px; }

  .sketch-mb-8 { margin-bottom: 8px; }
  .sketch-mb-16 { margin-bottom: 16px; }
  .sketch-mb-24 { margin-bottom: 24px; }

  .sketch-label {
    display: inline-block;
    padding: 2px 8px;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 3px;
    font-size: 10px;
    color: #856404;
    font-weight: bold;
    text-transform: uppercase;
  }

  .sketch-annotation {
    position: absolute;
    background: #fff9c4;
    border: 1px solid #f9a825;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 10px;
    color: #f57f17;
    transform: rotate(-2deg);
    box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
  }

  .sketch-divider {
    height: 2px;
    background: linear-gradient(to right, transparent, #ccc 20%, #ccc 80%, transparent);
    margin: 16px 0;
  }

  @media (max-width: 768px) {
    .sketch-grid-2,
    .sketch-grid-3,
    .sketch-grid-4 {
      grid-template-columns: 1fr;
    }
    .sketch-hero {
      padding: 24px 16px;
    }
    .sketch-heading {
      font-size: 22px;
    }
  }
</style>
`

// System prompt for visual wireframe generation
const SYSTEM_PROMPT = `You are an expert UI/UX designer creating visual HTML wireframes with a hand-drawn sketch aesthetic.

Given a source HTML page structure and variant plans, generate visual wireframe HTML for each variant.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no code blocks
2. Generate complete, valid HTML for each wireframe using the provided CSS classes
3. The wireframe should look like a "fat marker sketch" - rough, hand-drawn style
4. Use gray placeholders for images, lined patterns for text blocks
5. Focus on LAYOUT and STRUCTURE, not detailed content
6. Each variant wireframe must be meaningfully different based on its plan

Available CSS classes to use:
- Layout: .wireframe-container, .sketch-flex, .sketch-grid-2/3/4, .sketch-section
- Boxes: .sketch-box, .sketch-card, .sketch-sidebar
- Header: .sketch-header, .sketch-logo, .sketch-nav, .sketch-nav-item
- Content: .sketch-hero, .sketch-heading, .sketch-subheading, .sketch-text-block
- Images: .sketch-image-placeholder (include <span>Image</span> inside)
- Buttons: .sketch-button, .sketch-button-outline
- Form: .sketch-input
- Footer: .sketch-footer
- Spacing: .sketch-p-16/24, .sketch-mb-8/16/24, .sketch-gap-8/16/24
- Utility: .sketch-flex-center, .sketch-divider, .sketch-label, .sketch-annotation

JSON Schema (MUST follow exactly):
{
  "wireframes": [
    {
      "variantIndex": 1,
      "planId": "plan-uuid-here",
      "wireframeHtml": "<div class='wireframe-container'>...complete HTML wireframe...</div>"
    }
  ]
}

IMPORTANT: The wireframeHtml must be the BODY content only (no <html>, <head>, or <body> tags).
Focus on creating a clear visual representation of the layout described in each variant plan.`

function buildWireframePrompt(request: GenerateVisualWireframesRequest): string {
  let prompt = `Source HTML Structure (for reference):\n${request.compactedHtml.slice(0, 8000)}\n\n`

  if (request.uiMetadata) {
    prompt += `Current UI Components:\n`
    prompt += `- Components: ${request.uiMetadata.components?.map(c => `${c.type}(${c.count})`).join(', ')}\n`
    prompt += `- Layout: ${JSON.stringify(request.uiMetadata.layout?.gridSystems || [])}\n\n`
  }

  prompt += `Variant Plans to Create Visual Wireframes For:\n\n`

  const plansToProcess = request.selectedVariants
    ? request.plans.filter(p => request.selectedVariants!.includes(p.variantIndex))
    : request.plans

  for (const plan of plansToProcess) {
    prompt += `--- Variant ${plan.variantIndex}: ${plan.title} ---\n`
    prompt += `Description: ${plan.description}\n`
    prompt += `Key Changes: ${plan.keyChanges.join(', ')}\n`
    prompt += `Style Notes: ${plan.styleNotes}\n\n`
  }

  prompt += `Generate a visual HTML wireframe for each variant. Use the provided CSS classes to create a hand-drawn sketch look. Return ONLY the JSON object with a "wireframes" array.`

  return prompt
}

function parseWireframes(response: string, plans: GenerateVisualWireframesRequest['plans']): Array<{variantIndex: number, planId: string, wireframeHtml: string}> {
  let cleaned = response.trim()

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  cleaned = cleaned.trim()

  const parsed = JSON.parse(cleaned)
  const wireframes = parsed.wireframes || parsed

  if (!Array.isArray(wireframes)) {
    throw new Error('Expected wireframes array')
  }

  return wireframes.map((w, i) => {
    const plan = plans.find(p => p.variantIndex === w.variantIndex) || plans[i]
    return {
      variantIndex: w.variantIndex || (i + 1),
      planId: plan?.id || w.planId,
      wireframeHtml: w.wireframeHtml || w.html || '',
    }
  })
}

function buildFullHtml(bodyContent: string, variantIndex: number, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wireframe - Variant ${variantIndex}: ${title}</title>
  ${SKETCH_STYLES}
</head>
<body>
  <div class="sketch-label" style="position: fixed; top: 8px; right: 8px; z-index: 1000;">
    Variant ${variantIndex}: ${title}
  </div>
  ${bodyContent}
</body>
</html>`
}

// Generate with Anthropic
async function generateWithAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  console.log('[generate-visual-wireframes] Calling Anthropic API')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Anthropic API error')
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

// Generate with OpenAI
async function generateWithOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  console.log('[generate-visual-wireframes] Calling OpenAI API')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      max_tokens: 16384,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API error')
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

// Generate with Google
async function generateWithGoogle(apiKey: string, model: string, prompt: string): Promise<string> {
  console.log('[generate-visual-wireframes] Calling Google API')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }] }],
        generationConfig: {
          maxOutputTokens: 16384,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Google AI API error')
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

Deno.serve(async (req) => {
  console.log('[generate-visual-wireframes] Request received:', req.method)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header')
    }
    const jwt = authHeader.replace('Bearer ', '')

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !user) {
      throw new Error(`Unauthorized: ${userError?.message || 'Invalid token'}`)
    }
    console.log('[generate-visual-wireframes] User authenticated:', user.id)

    // Parse request
    const body: GenerateVisualWireframesRequest = await req.json()
    console.log('[generate-visual-wireframes] Session:', body.sessionId, 'Plans:', body.plans?.length, 'Selected:', body.selectedVariants)

    if (!body.sessionId || !body.plans || !body.compactedHtml) {
      throw new Error('Missing required fields: sessionId, plans, compactedHtml')
    }

    // Get user's API key
    const requestedProvider = body.provider
    let keyQuery = supabase
      .from('user_api_key_refs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (requestedProvider) {
      keyQuery = keyQuery.eq('provider', requestedProvider)
    }

    const { data: keyConfigs, error: keyError } = await keyQuery.limit(1)
    const keyConfig = keyConfigs?.[0]

    if (keyError || !keyConfig) {
      throw new Error('No API key configured. Please add your API key in Settings.')
    }

    const modelToUse = body.model || keyConfig.model
    console.log('[generate-visual-wireframes] Using provider:', keyConfig.provider, 'model:', modelToUse)

    // Get decrypted API key
    const { data: apiKey, error: decryptError } = await supabase
      .rpc('get_api_key', { p_user_id: user.id, p_provider: keyConfig.provider })

    if (decryptError || !apiKey) {
      throw new Error('Failed to retrieve API key')
    }

    // Build prompt
    const prompt = buildWireframePrompt(body)

    // Generate wireframes based on provider
    const startTime = Date.now()
    let rawResponse: string

    switch (keyConfig.provider) {
      case 'anthropic':
        rawResponse = await generateWithAnthropic(apiKey, modelToUse, prompt)
        break
      case 'openai':
        rawResponse = await generateWithOpenAI(apiKey, modelToUse, prompt)
        break
      case 'google':
        rawResponse = await generateWithGoogle(apiKey, modelToUse, prompt)
        break
      default:
        throw new Error(`Unsupported provider: ${keyConfig.provider}`)
    }

    const durationMs = Date.now() - startTime
    console.log('[generate-visual-wireframes] Raw response length:', rawResponse.length, 'Duration:', durationMs, 'ms')

    // Parse wireframes
    const parsedWireframes = parseWireframes(rawResponse, body.plans)
    console.log('[generate-visual-wireframes] Parsed', parsedWireframes.length, 'wireframes')

    // Upload wireframes to storage and update database
    const results: VisualWireframeResult[] = []

    for (const wf of parsedWireframes) {
      const plan = body.plans.find(p => p.variantIndex === wf.variantIndex)
      const fullHtml = buildFullHtml(wf.wireframeHtml, wf.variantIndex, plan?.title || `Variant ${wf.variantIndex}`)

      // Upload to storage
      const wireframePath = `${user.id}/${body.sessionId}/wireframe_${wf.variantIndex}.html`

      const { error: uploadError } = await supabase.storage
        .from('vibe-files')
        .upload(wireframePath, new Blob([fullHtml], { type: 'text/html' }), {
          contentType: 'text/html',
          upsert: true,
        })

      if (uploadError) {
        console.error('[generate-visual-wireframes] Upload error for variant', wf.variantIndex, uploadError)
        continue
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('vibe-files')
        .getPublicUrl(wireframePath)

      // Update variant plan with wireframe URL
      if (wf.planId) {
        await supabase
          .from('vibe_variant_plans')
          .update({
            wireframe_text: wf.wireframeHtml, // Store HTML body for reference
            wireframe_url: urlData.publicUrl,
            wireframe_path: wireframePath,
          })
          .eq('id', wf.planId)
      }

      results.push({
        variantIndex: wf.variantIndex,
        planId: wf.planId,
        wireframeHtml: fullHtml,
        wireframePath,
        wireframeUrl: urlData.publicUrl,
      })
    }

    // Update session status
    await supabase
      .from('vibe_sessions')
      .update({ status: 'wireframe_ready' })
      .eq('id', body.sessionId)

    console.log('[generate-visual-wireframes] Visual wireframe generation complete')

    return new Response(
      JSON.stringify({
        success: true,
        wireframes: results,
        model: modelToUse,
        provider: keyConfig.provider,
        durationMs,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[generate-visual-wireframes] Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
