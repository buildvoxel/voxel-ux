// Supabase Edge Function for extracting UX guidelines from product video frames
// Uses vision models (Claude, Gemini, GPT-4V) to analyze video screenshots
// Deploy with: supabase functions deploy extract-ux-guidelines

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractGuidelinesRequest {
  videoName: string
  frames: string[]              // Array of base64-encoded video frames (JPEG/PNG)
  videoDescription?: string     // Optional description of the video
  provider?: 'anthropic' | 'openai' | 'google'
  model?: string
}

type UXGuidelineCategory =
  | 'navigation'
  | 'interaction'
  | 'feedback'
  | 'layout'
  | 'content'
  | 'accessibility'
  | 'flow'

interface UXGuideline {
  category: UXGuidelineCategory
  title: string
  description: string
  examples?: string[]
}

interface ExtractGuidelinesResponse {
  guidelines: UXGuideline[]
  summary: string
}

const SYSTEM_PROMPT = `You are a UX analyst expert at extracting product UX guidelines by analyzing product demo videos.

You will be shown frames/screenshots from a product demo video. Analyze these visual frames to identify UX patterns, interaction conventions, navigation flows, and design principles demonstrated in the product.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanations
2. Extract concrete, actionable guidelines from what you SEE in the frames
3. Focus on patterns that would help an AI generate consistent UI prototypes
4. Note specific visual elements, colors, component styles you observe
5. Categorize each guideline appropriately

CATEGORIES:
- navigation: How users navigate between screens, menus, sidebar behaviors
- interaction: Button styles, click/hover behaviors, form patterns, gesture conventions
- feedback: Loading states, success/error messages, toast notifications, confirmations
- layout: Spacing patterns, component placement, responsive behaviors, visual hierarchy
- content: Tone of voice, labeling conventions, microcopy style, terminology
- accessibility: Keyboard navigation hints, contrast, focus indicators
- flow: Multi-step processes, wizard patterns, state transitions, onboarding sequences

JSON Schema (MUST follow exactly):
{
  "summary": "Brief 1-2 sentence summary of the product's overall UX approach based on what you see",
  "guidelines": [
    {
      "category": "navigation|interaction|feedback|layout|content|accessibility|flow",
      "title": "Short descriptive title (e.g., 'Sidebar Navigation Pattern')",
      "description": "Detailed description of the UX pattern observed in the frames",
      "examples": ["Specific visual example from the frames"]
    }
  ]
}

ANALYZE THE FRAMES FOR:
- Button styles (colors, shapes, sizes, states)
- Navigation structure (sidebar, tabs, breadcrumbs, menus)
- Card/container styles and spacing
- Typography hierarchy and font usage
- Color scheme and brand colors
- Form field styles and layouts
- Modal/dialog patterns
- Loading and empty states
- Icon styles and usage
- Visual feedback patterns

Extract 5-15 specific, actionable guidelines based on what you observe. Quality over quantity.`

const TEXT_PROMPT = `Analyze these frames from a product demo video and extract UX guidelines.

Look carefully at each frame and identify:
1. Visual design patterns (colors, typography, spacing)
2. Component styles (buttons, forms, cards, navigation)
3. Interaction patterns suggested by the UI
4. Layout conventions and visual hierarchy
5. Any consistent design language

Return your analysis as JSON following the schema in your instructions.`

function parseGuidelines(response: string): ExtractGuidelinesResponse {
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

  // Validate categories
  const validCategories = ['navigation', 'interaction', 'feedback', 'layout', 'content', 'accessibility', 'flow']
  const guidelines = (parsed.guidelines || []).map((g: UXGuideline) => ({
    category: validCategories.includes(g.category) ? g.category : 'interaction',
    title: g.title || 'Untitled Guideline',
    description: g.description || '',
    examples: Array.isArray(g.examples) ? g.examples : [],
  }))

  return {
    summary: parsed.summary || 'UX guidelines extracted from product video.',
    guidelines,
  }
}

// Generate with Anthropic Claude (Vision)
async function generateWithAnthropic(apiKey: string, model: string, frames: string[], videoName: string): Promise<string> {
  console.log('[extract-ux-guidelines] Calling Anthropic Vision API with', frames.length, 'frames')

  // Build content array with images and text
  const content: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = []

  // Add each frame as an image
  for (let i = 0; i < frames.length; i++) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: frames[i],
      },
    })
  }

  // Add the analysis prompt
  content.push({
    type: 'text',
    text: `Video: ${videoName}\n\n${TEXT_PROMPT}`,
  })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Anthropic API error')
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

// Generate with OpenAI GPT-4V (Vision)
async function generateWithOpenAI(apiKey: string, model: string, frames: string[], videoName: string): Promise<string> {
  console.log('[extract-ux-guidelines] Calling OpenAI Vision API with', frames.length, 'frames')

  // Build content array with images and text
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = []

  // Add each frame as an image
  for (let i = 0; i < frames.length; i++) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${frames[i]}`,
      },
    })
  }

  // Add the analysis prompt
  content.push({
    type: 'text',
    text: `Video: ${videoName}\n\n${TEXT_PROMPT}`,
  })

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
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

// Generate with Google Gemini (Vision)
async function generateWithGoogle(apiKey: string, model: string, frames: string[], videoName: string): Promise<string> {
  console.log('[extract-ux-guidelines] Calling Google Gemini Vision API with', frames.length, 'frames')

  // Build parts array with images and text
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = []

  // Add each frame as inline_data
  for (let i = 0; i < frames.length; i++) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: frames[i],
      },
    })
  }

  // Add the analysis prompt
  parts.push({
    text: `${SYSTEM_PROMPT}\n\nVideo: ${videoName}\n\n${TEXT_PROMPT}`,
  })

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          maxOutputTokens: 4096,
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
  console.log('[extract-ux-guidelines] Request received:', req.method)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header')
    }

    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseAnonKey) {
      throw new Error('Missing SUPABASE_ANON_KEY environment variable')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error(`Unauthorized: ${userError?.message || 'Invalid token'}`)
    }
    console.log('[extract-ux-guidelines] User authenticated:', user.id)

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body: ExtractGuidelinesRequest = await req.json()
    console.log('[extract-ux-guidelines] Video:', body.videoName, 'Frames:', body.frames?.length)

    if (!body.videoName || !body.frames || body.frames.length === 0) {
      throw new Error('Missing required fields: videoName, frames (array of base64 images)')
    }

    // Limit frames to prevent token overflow (max 10 frames)
    const framesToUse = body.frames.slice(0, 10)
    console.log('[extract-ux-guidelines] Using', framesToUse.length, 'frames for analysis')

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
    console.log('[extract-ux-guidelines] Using provider:', keyConfig.provider, 'model:', modelToUse)

    const { data: apiKey, error: decryptError } = await supabase
      .rpc('get_api_key', { p_user_id: user.id, p_provider: keyConfig.provider })

    if (decryptError || !apiKey) {
      throw new Error('Failed to retrieve API key')
    }

    const startTime = Date.now()
    let rawResponse: string

    switch (keyConfig.provider) {
      case 'anthropic':
        rawResponse = await generateWithAnthropic(apiKey, modelToUse, framesToUse, body.videoName)
        break
      case 'openai':
        rawResponse = await generateWithOpenAI(apiKey, modelToUse, framesToUse, body.videoName)
        break
      case 'google':
        rawResponse = await generateWithGoogle(apiKey, modelToUse, framesToUse, body.videoName)
        break
      default:
        throw new Error(`Unsupported provider: ${keyConfig.provider}`)
    }

    const durationMs = Date.now() - startTime
    console.log('[extract-ux-guidelines] Response length:', rawResponse.length, 'Duration:', durationMs, 'ms')

    const result = parseGuidelines(rawResponse)
    console.log('[extract-ux-guidelines] Extracted', result.guidelines.length, 'guidelines')

    return new Response(
      JSON.stringify({
        success: true,
        summary: result.summary,
        guidelines: result.guidelines,
        model: modelToUse,
        provider: keyConfig.provider,
        framesAnalyzed: framesToUse.length,
        durationMs,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[extract-ux-guidelines] Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
