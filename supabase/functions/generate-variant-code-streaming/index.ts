// Supabase Edge Function for streaming variant HTML/CSS code generation
// VISION-FIRST APPROACH: Uses screenshot + design tokens + wireframe instead of source HTML
// API keys are retrieved from Vault via RPC
// Deploy with: supabase functions deploy generate-variant-code-streaming

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DesignTokens {
  colors: {
    primary: string[]
    secondary: string[]
    background: string[]
    text: string[]
    accent: string[]
  }
  typography: {
    fontFamilies: string[]
    fontSizes: string[]
    fontWeights: string[]
  }
  layout: {
    containerWidths: string[]
    spacing: string[]
  }
  components: Array<{ type: string; count: number }>
}

interface GenerateCodeRequest {
  sessionId: string
  planId: string
  variantIndex: number
  plan: {
    title: string
    description: string
    keyChanges: string[]
    styleNotes: string
  }
  // Vision-first approach - screenshot is now primary
  screenshotBase64: string  // REQUIRED: Base64-encoded screenshot of current screen
  wireframeText?: string    // Layout description from wireframe phase
  designTokens?: DesignTokens  // Extracted design system tokens
  productContext?: string   // Summary of product context
  provider?: 'anthropic' | 'openai' | 'google'
  model?: string
  // Legacy - kept for backwards compatibility but not used in prompt
  sourceHtml?: string
  uiMetadata?: Record<string, unknown>
}

// NEW System prompt - Vision-first, generates fresh HTML
const SYSTEM_PROMPT = `You are an expert front-end developer creating a HIGH-FIDELITY HTML prototype.

## YOUR TASK:
You will receive:
1. A SCREENSHOT of an existing web application (this is your visual reference)
2. A VARIANT PLAN describing what changes to make
3. DESIGN TOKENS (colors, fonts, spacing) to maintain visual consistency
4. Optional: A wireframe layout description and product context

## YOUR OUTPUT:
Generate a complete, standalone HTML document that:
1. LOOKS LIKE the screenshot but with the variant plan changes applied
2. Uses the EXACT colors, fonts, and spacing from the design tokens
3. Is fully functional with all interactive elements
4. Is production-quality, responsive, and accessible

## CRITICAL REQUIREMENTS:
1. Output ONLY valid HTML - no markdown, no explanations
2. Start with <!DOCTYPE html> and include complete <html>, <head>, <body>
3. Include ALL styles inline or in a <style> block - no external CSS
4. Include any necessary JavaScript for interactivity
5. Use the design tokens for ALL colors, fonts, and spacing
6. Make the layout match the screenshot's structure
7. Apply the variant plan's modifications thoughtfully

## HTML STRUCTURE:
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Appropriate Title]</title>
  <style>
    /* Reset and base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* Design system variables */
    :root {
      /* Colors from tokens */
      /* Typography from tokens */
      /* Spacing from tokens */
    }

    /* Component styles */
  </style>
</head>
<body>
  <!-- Semantic, accessible HTML -->
</body>
</html>
\`\`\`

## STYLE GUIDE:
- Use CSS custom properties (--var-name) for design tokens
- Use flexbox/grid for layouts
- Use rem units for spacing
- Include hover states for interactive elements
- Add appropriate aria-labels for accessibility
- Make it responsive (mobile-friendly)

Start your response directly with <!DOCTYPE html>.`

function buildVisionPrompt(request: GenerateCodeRequest): string {
  let prompt = `## VARIANT TO CREATE:\n`
  prompt += `**${request.plan.title}**\n\n`
  prompt += `${request.plan.description}\n\n`

  prompt += `## CHANGES TO APPLY:\n`
  request.plan.keyChanges.forEach((change, i) => {
    prompt += `${i + 1}. ${change}\n`
  })
  prompt += '\n'

  if (request.plan.styleNotes) {
    prompt += `## STYLE NOTES:\n${request.plan.styleNotes}\n\n`
  }

  // Design tokens are crucial for consistency
  if (request.designTokens) {
    prompt += `## DESIGN TOKENS (use these EXACT values):\n`

    if (request.designTokens.colors) {
      prompt += `\n### Colors:\n`
      const { colors } = request.designTokens
      if (colors.primary?.length) prompt += `- Primary: ${colors.primary.slice(0, 3).join(', ')}\n`
      if (colors.secondary?.length) prompt += `- Secondary: ${colors.secondary.slice(0, 3).join(', ')}\n`
      if (colors.background?.length) prompt += `- Backgrounds: ${colors.background.slice(0, 3).join(', ')}\n`
      if (colors.text?.length) prompt += `- Text: ${colors.text.slice(0, 3).join(', ')}\n`
      if (colors.accent?.length) prompt += `- Accent: ${colors.accent.slice(0, 3).join(', ')}\n`
    }

    if (request.designTokens.typography) {
      prompt += `\n### Typography:\n`
      const { typography } = request.designTokens
      if (typography.fontFamilies?.length) prompt += `- Font families: ${typography.fontFamilies.slice(0, 3).join(', ')}\n`
      if (typography.fontSizes?.length) prompt += `- Font sizes: ${typography.fontSizes.slice(0, 5).join(', ')}\n`
      if (typography.fontWeights?.length) prompt += `- Font weights: ${typography.fontWeights.join(', ')}\n`
    }

    if (request.designTokens.layout) {
      prompt += `\n### Layout:\n`
      const { layout } = request.designTokens
      if (layout.spacing?.length) prompt += `- Spacing scale: ${layout.spacing.slice(0, 6).join(', ')}\n`
      if (layout.containerWidths?.length) prompt += `- Container widths: ${layout.containerWidths.slice(0, 3).join(', ')}\n`
    }

    if (request.designTokens.components?.length) {
      prompt += `\n### Components detected:\n`
      request.designTokens.components.slice(0, 10).forEach(comp => {
        prompt += `- ${comp.type} (${comp.count}x)\n`
      })
    }
    prompt += '\n'
  }

  // Wireframe provides structural guidance
  if (request.wireframeText) {
    prompt += `## WIREFRAME LAYOUT:\n${request.wireframeText}\n\n`
  }

  // Product context helps with appropriate content/tone
  if (request.productContext) {
    prompt += `## PRODUCT CONTEXT:\n${request.productContext.slice(0, 2000)}\n\n`
  }

  prompt += `## INSTRUCTIONS:\n`
  prompt += `Look at the screenshot above. Create an HTML page that:\n`
  prompt += `1. Recreates the visual layout and structure you see\n`
  prompt += `2. Applies the changes described in the variant plan\n`
  prompt += `3. Uses the exact design tokens provided for consistency\n`
  prompt += `4. Is a complete, functional, production-ready HTML document\n\n`
  prompt += `Output ONLY the HTML code, starting with <!DOCTYPE html>.`

  return prompt
}

// Create SSE encoder
function createSSEEncoder() {
  const encoder = new TextEncoder()
  return {
    encode: (event: string, data: string) => {
      return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    },
    encodeObject: (event: string, data: unknown) => {
      return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    },
  }
}

// Get API key from Vault via RPC
async function getApiKeyFromVault(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  provider: string
): Promise<string | null> {
  console.log('[streaming] Getting API key from Vault for provider:', provider)

  const { data, error } = await supabase.rpc('get_api_key', {
    p_user_id: userId,
    p_provider: provider,
  })

  if (error) {
    console.error('[streaming] Error getting API key from Vault:', error)
    return null
  }

  if (!data) {
    console.error('[streaming] No API key found in Vault for provider:', provider)
    return null
  }

  console.log('[streaming] Successfully retrieved API key from Vault')
  return data
}

// Get user ID from JWT token
function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authHeader.slice(7)
    // Decode JWT payload (middle part)
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload.sub || null
  } catch (error) {
    console.error('[streaming] Error decoding JWT:', error)
    return null
  }
}

// Stream with Anthropic (VISION REQUIRED)
async function* streamWithAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64: string
): AsyncGenerator<string> {
  console.log('[streaming] Calling Anthropic with VISION-FIRST approach')

  // Vision is now required - image + text prompt
  const content = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: screenshotBase64,
      },
    },
    {
      type: 'text',
      text: 'This screenshot shows the current application. Use it as your visual reference.\n\n' + prompt,
    },
  ]

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
      stream: true,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('[streaming] Anthropic API error:', response.status, error)
    throw new Error(error.error?.message || `Anthropic API error: ${response.status}`)
  }

  console.log('[streaming] Anthropic response OK, streaming...')
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield parsed.delta.text
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

// Stream with OpenAI (VISION REQUIRED)
async function* streamWithOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64: string
): AsyncGenerator<string> {
  console.log('[streaming] Calling OpenAI with VISION-FIRST approach')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      max_tokens: 16384,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${screenshotBase64}`,
              },
            },
            {
              type: 'text',
              text: 'This screenshot shows the current application. Use it as your visual reference.\n\n' + prompt,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('[streaming] OpenAI API error:', response.status, error)
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
  }

  console.log('[streaming] OpenAI response OK, streaming...')
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

// Stream with Google (VISION REQUIRED)
async function* streamWithGoogle(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64: string
): AsyncGenerator<string> {
  console.log('[streaming] Calling Google with VISION-FIRST approach')

  const googleModel = model || 'gemini-2.0-flash'
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:streamGenerateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: screenshotBase64,
                },
              },
              {
                text: SYSTEM_PROMPT + '\n\nThis screenshot shows the current application. Use it as your visual reference.\n\n' + prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 16384,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    console.error('[streaming] Google API error:', response.status, error)
    throw new Error(error.error?.message || `Google AI API error: ${response.status}`)
  }

  console.log('[streaming] Google response OK, streaming...')
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Google returns JSON array chunks
    try {
      // Try to parse complete JSON objects from buffer
      const jsonMatch = buffer.match(/\{[\s\S]*?"text"\s*:\s*"[^"]*"[\s\S]*?\}/g)
      if (jsonMatch) {
        for (const jsonStr of jsonMatch) {
          try {
            const parsed = JSON.parse(jsonStr)
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || parsed.text
            if (text) yield text
          } catch {
            // Continue trying
          }
        }
        // Keep unprocessed part
        const lastMatch = jsonMatch[jsonMatch.length - 1]
        const lastIndex = buffer.lastIndexOf(lastMatch) + lastMatch.length
        buffer = buffer.slice(lastIndex)
      }
    } catch {
      // Keep buffering
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const request: GenerateCodeRequest = await req.json()
    console.log('[streaming] Vision-first code generation request:', {
      sessionId: request.sessionId,
      variantIndex: request.variantIndex,
      planTitle: request.plan.title,
      hasScreenshot: !!request.screenshotBase64,
      screenshotSize: request.screenshotBase64 ? `${Math.round(request.screenshotBase64.length / 1024)}KB` : 'none',
      hasWireframe: !!request.wireframeText,
      hasDesignTokens: !!request.designTokens,
      hasProductContext: !!request.productContext,
      provider: request.provider,
      model: request.model,
    })

    // Screenshot is now REQUIRED for vision-first approach
    if (!request.screenshotBase64) {
      console.error('[streaming] Screenshot is REQUIRED for vision-first generation')
      return new Response(
        JSON.stringify({ error: 'Screenshot is required for code generation. Please ensure the screen has been captured.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user ID from JWT
    const authHeader = req.headers.get('authorization')
    const userId = getUserIdFromToken(authHeader)

    if (!userId) {
      console.error('[streaming] No user ID found in JWT')
      return new Response(
        JSON.stringify({ error: 'Authentication required. Please log in.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[streaming] User ID from JWT:', userId)

    // Initialize Supabase client with service role for Vault access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Determine provider and get API key from Vault
    const provider = request.provider || 'anthropic'
    const apiKey = await getApiKeyFromVault(supabase, userId, provider)

    if (!apiKey) {
      console.error('[streaming] No API key found for provider:', provider)
      return new Response(
        JSON.stringify({
          error: `No ${provider} API key configured. Please add your API key in Settings.`,
          errorCode: 'API_KEY_MISSING',
          provider: provider,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build the vision-first prompt (no source HTML)
    const prompt = buildVisionPrompt(request)
    console.log('[streaming] Built vision prompt, length:', prompt.length)

    // Create streaming response
    const sse = createSSEEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullHtml = ''
          let generator: AsyncGenerator<string>

          // Select provider
          switch (provider) {
            case 'openai':
              generator = streamWithOpenAI(apiKey!, request.model || 'gpt-4o', prompt, request.screenshotBase64)
              break
            case 'google':
              generator = streamWithGoogle(apiKey!, request.model || 'gemini-2.0-flash', prompt, request.screenshotBase64)
              break
            default:
              generator = streamWithAnthropic(apiKey!, request.model || 'claude-sonnet-4-20250514', prompt, request.screenshotBase64)
          }

          // Stream chunks
          for await (const chunk of generator) {
            fullHtml += chunk
            controller.enqueue(sse.encodeObject('chunk', { chunk, fullHtml }))
          }

          // Save to database
          // Get the variant record
          const { data: variant } = await supabase
            .from('vibe_variants')
            .select('id')
            .eq('session_id', request.sessionId)
            .eq('variant_index', request.variantIndex)
            .single()

          if (variant) {
            // Update existing variant
            await supabase
              .from('vibe_variants')
              .update({
                html: fullHtml,
                status: 'complete',
                updated_at: new Date().toISOString(),
              })
              .eq('id', variant.id)
          } else {
            // Create new variant
            await supabase.from('vibe_variants').insert({
              session_id: request.sessionId,
              variant_index: request.variantIndex,
              title: request.plan.title,
              description: request.plan.description,
              html: fullHtml,
              status: 'complete',
            })
          }

          // Send complete event
          controller.enqueue(sse.encodeObject('complete', {
            variantIndex: request.variantIndex,
            htmlLength: fullHtml.length,
          }))
          controller.close()
        } catch (error) {
          console.error('[streaming] Generation error:', error)
          controller.enqueue(sse.encodeObject('error', {
            message: error instanceof Error ? error.message : 'Generation failed',
          }))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[streaming] Request error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
