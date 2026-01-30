// Supabase Edge Function for generating wireframe descriptions
// Creates text-based wireframe layouts for each variant plan
// Deploy with: supabase functions deploy generate-wireframes

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateWireframesRequest {
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
  provider?: 'anthropic' | 'openai' | 'google'
  model?: string
}

interface WireframeResult {
  variantIndex: number
  planId: string
  wireframeText: string
  layoutDescription: string
  componentList: string[]
}

// System prompt for wireframe generation
const SYSTEM_PROMPT = `You are an expert UI/UX designer creating wireframe descriptions for web page variants.

Given a source HTML page structure and variant plans, generate detailed text-based wireframe descriptions for each variant.

For each variant, provide:
1. A text-based wireframe layout using ASCII art or structured text showing the page structure
2. A brief layout description explaining the visual hierarchy
3. A list of key components and their placement

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no code blocks
2. Each wireframe should be meaningfully different based on the variant plan
3. Use ASCII-style boxes and labels to represent the layout
4. Focus on structure and placement, not colors or detailed styling

JSON Schema (MUST follow exactly):
{
  "wireframes": [
    {
      "variantIndex": 1,
      "planId": "uuid-here",
      "wireframeText": "ASCII art wireframe here using | - + [ ] characters",
      "layoutDescription": "Brief description of the layout approach",
      "componentList": ["Header with logo left", "Nav menu right", "Hero section full-width", ...]
    }
  ]
}

Example wireframeText format:
+------------------------------------------+
|  [LOGO]              [NAV] [NAV] [BTN]   |
+------------------------------------------+
|                                          |
|     [====== HERO HEADLINE ======]        |
|     [    subtitle text here    ]         |
|           [ CTA BUTTON ]                 |
|                                          |
+------------------------------------------+
|  [CARD]    [CARD]    [CARD]              |
+------------------------------------------+`

function buildWireframePrompt(request: GenerateWireframesRequest): string {
  let prompt = `Source HTML Structure (compacted):\n${request.compactedHtml.slice(0, 10000)}\n\n`

  if (request.uiMetadata) {
    prompt += `Current UI Components:\n`
    prompt += `- Components: ${request.uiMetadata.components?.map(c => `${c.type}(${c.count})`).join(', ')}\n`
    prompt += `- Layout systems: ${JSON.stringify(request.uiMetadata.layout?.gridSystems || [])}\n\n`
  }

  prompt += `Variant Plans to Create Wireframes For:\n\n`

  for (const plan of request.plans) {
    prompt += `--- Variant ${plan.variantIndex}: ${plan.title} ---\n`
    prompt += `Description: ${plan.description}\n`
    prompt += `Key Changes: ${plan.keyChanges.join(', ')}\n`
    prompt += `Style Notes: ${plan.styleNotes}\n\n`
  }

  prompt += `Generate a wireframe description for each variant. Return ONLY the JSON object with a "wireframes" array.`

  return prompt
}

// Parse and validate JSON response
function parseWireframes(response: string, plans: GenerateWireframesRequest['plans']): WireframeResult[] {
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

  // Map plan IDs to results
  return wireframes.map((w, i) => {
    const plan = plans.find(p => p.variantIndex === w.variantIndex) || plans[i]
    return {
      variantIndex: w.variantIndex || (i + 1),
      planId: plan?.id || w.planId,
      wireframeText: w.wireframeText || w.wireframe || '',
      layoutDescription: w.layoutDescription || w.description || '',
      componentList: Array.isArray(w.componentList) ? w.componentList : [],
    }
  })
}

// Generate with Anthropic
async function generateWithAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  console.log('[generate-wireframes] Calling Anthropic API')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 8192,
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
  console.log('[generate-wireframes] Calling OpenAI API')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      max_tokens: 8192,
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
  console.log('[generate-wireframes] Calling Google API')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
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
  console.log('[generate-wireframes] Request received:', req.method)

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
    console.log('[generate-wireframes] User authenticated:', user.id)

    // Parse request
    const body: GenerateWireframesRequest = await req.json()
    console.log('[generate-wireframes] Session:', body.sessionId, 'Plans:', body.plans?.length)

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
    console.log('[generate-wireframes] Using provider:', keyConfig.provider, 'model:', modelToUse)

    // Get decrypted API key
    const { data: apiKey, error: decryptError } = await supabase
      .rpc('get_api_key', { p_user_id: user.id, p_provider: keyConfig.provider })

    if (decryptError || !apiKey) {
      throw new Error('Failed to retrieve API key')
    }

    // Build prompt
    const prompt = buildWireframePrompt(body)

    // Generate wireframes based on provider
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

    console.log('[generate-wireframes] Raw response length:', rawResponse.length)

    // Parse wireframes
    const wireframes = parseWireframes(rawResponse, body.plans)
    console.log('[generate-wireframes] Parsed', wireframes.length, 'wireframes')

    // Update variant plans with wireframe text
    for (const wf of wireframes) {
      if (wf.planId) {
        await supabase
          .from('vibe_variant_plans')
          .update({
            wireframe_text: wf.wireframeText,
            layout_description: wf.layoutDescription,
            component_list: wf.componentList,
          })
          .eq('id', wf.planId)
      }
    }

    // Update session status
    await supabase
      .from('vibe_sessions')
      .update({ status: 'wireframe_ready' })
      .eq('id', body.sessionId)

    console.log('[generate-wireframes] Wireframe generation complete')

    return new Response(
      JSON.stringify({
        success: true,
        wireframes,
        model: modelToUse,
        provider: keyConfig.provider,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[generate-wireframes] Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
