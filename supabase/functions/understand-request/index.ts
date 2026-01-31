// Supabase Edge Function for understanding user's design request
// Returns LLM's interpretation of the user's prompt before planning
// Deploy with: supabase functions deploy understand-request

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UnderstandRequest {
  sessionId: string
  prompt: string
  compactedHtml: string
  uiMetadata?: {
    colors: Record<string, string[]>
    typography: Record<string, string[]>
    layout: Record<string, string[]>
    components: Array<{ type: string; count: number }>
  }
  productContext?: string
  provider?: 'anthropic' | 'openai' | 'google'
  model?: string
}

interface UnderstandingResponse {
  summary: string
  goals: string[]
  scope: string
  assumptions: string[]
  clarifyingQuestions?: string[]
}

// System prompt for understanding generation
const SYSTEM_PROMPT = `You are an expert UI/UX designer helping to understand a user's design modification request.

Your task is to carefully analyze the user's prompt and the existing UI, then articulate your understanding of what they want to achieve. This helps ensure alignment before generating design variants.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanations
2. Be specific about what changes you understand they want
3. Identify any implicit goals or constraints
4. Note any assumptions you're making
5. Optionally suggest clarifying questions if the request is ambiguous

JSON Schema (MUST follow exactly):
{
  "summary": "A 1-2 sentence summary of what the user wants in plain language",
  "goals": [
    "Primary goal 1",
    "Primary goal 2",
    "Primary goal 3"
  ],
  "scope": "Description of what parts of the UI will be affected and how extensively",
  "assumptions": [
    "Assumption 1 about the request",
    "Assumption 2 about constraints or preferences"
  ],
  "clarifyingQuestions": [
    "Optional question if something is unclear"
  ]
}

Be conversational and helpful in your summary - speak directly to the user. For example:
"I understand you want to modernize the dashboard by improving the visual hierarchy and making the data more scannable. The main goals seem to be..."

Do NOT just repeat the user's prompt back. Add your interpretation and professional insight.`

function buildUnderstandingPrompt(request: UnderstandRequest): string {
  let prompt = `User's Design Request: "${request.prompt}"\n\n`

  if (request.uiMetadata) {
    prompt += `Current UI Analysis:\n`
    prompt += `- Primary colors: ${JSON.stringify(request.uiMetadata.colors.primary || request.uiMetadata.colors.background || [])}\n`
    prompt += `- Font families: ${JSON.stringify(request.uiMetadata.typography.fontFamilies || [])}\n`
    prompt += `- Layout approach: ${JSON.stringify(request.uiMetadata.layout.gridSystems || request.uiMetadata.layout.flexboxUsage || [])}\n`
    prompt += `- UI components found: ${request.uiMetadata.components?.map(c => `${c.type}(${c.count})`).join(', ') || 'various'}\n\n`
  }

  if (request.productContext) {
    prompt += `Product Context:\n${request.productContext.slice(0, 1500)}\n\n`
  }

  prompt += `Existing Page HTML (for structure reference):\n${request.compactedHtml.slice(0, 10000)}\n\n`
  prompt += `Please analyze this request and provide your understanding as JSON. Focus on what the user truly wants to achieve, not just the literal words they used.`

  return prompt
}

// Parse and validate JSON response
function parseUnderstanding(response: string): UnderstandingResponse {
  // Clean response
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

  // Parse JSON
  const parsed = JSON.parse(cleaned)

  // Validate and normalize
  return {
    summary: parsed.summary || 'Understanding your request...',
    goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    scope: parsed.scope || 'The entire page will be considered for modifications.',
    assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
    clarifyingQuestions: Array.isArray(parsed.clarifyingQuestions) ? parsed.clarifyingQuestions : [],
  }
}

// Generate with Anthropic
async function generateWithAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  console.log('[understand-request] Calling Anthropic API')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 2048,
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
  console.log('[understand-request] Calling OpenAI API')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      max_tokens: 2048,
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
  console.log('[understand-request] Calling Google API')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }] }],
        generationConfig: {
          maxOutputTokens: 2048,
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
  console.log('[understand-request] Request received:', req.method)

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
    console.log('[understand-request] Auth header present:', !!authHeader)
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[understand-request] Missing or invalid auth header format')
      throw new Error('Missing or invalid authorization header')
    }

    // Get the anon key for user auth verification
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!supabaseAnonKey) {
      throw new Error('Missing SUPABASE_ANON_KEY environment variable')
    }

    // Create Supabase client with anon key and pass the auth header
    // This is the recommended way to verify user JWTs in edge functions
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verify user - the client will use the Authorization header
    console.log('[understand-request] Verifying user token...')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) {
      console.error('[understand-request] Auth error:', userError.message)
      throw new Error(`Unauthorized: ${userError.message}`)
    }
    if (!user) {
      console.error('[understand-request] No user found for token')
      throw new Error('Unauthorized: Invalid token - no user found')
    }
    console.log('[understand-request] User authenticated:', user.id, user.email)

    // Create a service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Parse request
    const body: UnderstandRequest = await req.json()
    console.log('[understand-request] Session:', body.sessionId, 'Prompt:', body.prompt?.slice(0, 100))

    if (!body.sessionId || !body.prompt || !body.compactedHtml) {
      throw new Error('Missing required fields: sessionId, prompt, compactedHtml')
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
    console.log('[understand-request] Using provider:', keyConfig.provider, 'model:', modelToUse)

    // Get decrypted API key
    const { data: apiKey, error: decryptError } = await supabase
      .rpc('get_api_key', { p_user_id: user.id, p_provider: keyConfig.provider })

    if (decryptError || !apiKey) {
      throw new Error('Failed to retrieve API key')
    }

    // Build prompt
    const prompt = buildUnderstandingPrompt(body)

    // Generate understanding based on provider
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
    console.log('[understand-request] Raw response length:', rawResponse.length, 'Duration:', durationMs, 'ms')

    // Parse and validate understanding
    const understanding = parseUnderstanding(rawResponse)
    console.log('[understand-request] Parsed understanding with', understanding.goals.length, 'goals')

    // Format understanding as readable text for storage
    const understandingText = formatUnderstandingText(understanding)

    // Update session with understanding
    const { error: updateError } = await supabase
      .from('vibe_sessions')
      .update({
        llm_understanding: understandingText,
        status: 'understanding_ready',
      })
      .eq('id', body.sessionId)

    if (updateError) {
      console.error('[understand-request] Failed to update session:', updateError)
      throw new Error('Failed to save understanding')
    }

    console.log('[understand-request] Understanding generation complete')

    return new Response(
      JSON.stringify({
        success: true,
        understanding,
        understandingText,
        model: modelToUse,
        provider: keyConfig.provider,
        durationMs,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[understand-request] Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Format understanding as readable text
function formatUnderstandingText(understanding: UnderstandingResponse): string {
  let text = understanding.summary + '\n\n'

  if (understanding.goals.length > 0) {
    text += '**Key Goals:**\n'
    understanding.goals.forEach((goal, i) => {
      text += `${i + 1}. ${goal}\n`
    })
    text += '\n'
  }

  text += `**Scope:** ${understanding.scope}\n\n`

  if (understanding.assumptions.length > 0) {
    text += '**Assumptions:**\n'
    understanding.assumptions.forEach(assumption => {
      text += `- ${assumption}\n`
    })
    text += '\n'
  }

  if (understanding.clarifyingQuestions && understanding.clarifyingQuestions.length > 0) {
    text += '**Questions for Clarification:**\n'
    understanding.clarifyingQuestions.forEach(q => {
      text += `- ${q}\n`
    })
  }

  return text.trim()
}
