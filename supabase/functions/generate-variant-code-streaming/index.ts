// Supabase Edge Function for streaming variant HTML/CSS code generation
// Uses Server-Sent Events (SSE) to stream chunks as the LLM generates
// Deploy with: supabase functions deploy generate-variant-code-streaming

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  sourceHtml: string
  uiMetadata?: Record<string, unknown>
  productContext?: string
  provider?: 'anthropic' | 'openai' | 'google'
  model?: string
}

// System prompt for code generation
const SYSTEM_PROMPT = `You are an expert front-end developer implementing a UI variant based on a design specification.

Your task is to modify the source HTML according to the variant plan provided. The result should be a complete, self-contained HTML document.

CRITICAL REQUIREMENTS:
1. Return ONLY the complete HTML document - no explanations, no markdown code blocks
2. Preserve all functionality from the original (forms, links, scripts)
3. Use inline styles for all CSS changes (no external stylesheets)
4. Ensure the HTML is valid and renders correctly in modern browsers
5. Implement ALL key changes from the variant plan
6. Maintain responsive design patterns from the original

IMPLEMENTATION GUIDELINES:
- For color changes: Update background-color, color, border-color properties
- For typography changes: Modify font-family, font-size, font-weight, line-height
- For layout changes: Adjust display, flex, grid, padding, margin properties
- For new components: Insert complete HTML with inline styles
- For removal: Delete the elements entirely (don't just hide them)

Start your response directly with <!DOCTYPE html> or <html>.`

function buildCodePrompt(request: GenerateCodeRequest): string {
  let prompt = `Variant Plan to Implement:\n`
  prompt += `Title: ${request.plan.title}\n`
  prompt += `Description: ${request.plan.description}\n`
  prompt += `Key Changes:\n${request.plan.keyChanges.map(c => `- ${c}`).join('\n')}\n`
  prompt += `Style Notes: ${request.plan.styleNotes}\n\n`

  if (request.productContext) {
    prompt += `Product Context:\n${request.productContext.slice(0, 1500)}\n\n`
  }

  if (request.uiMetadata) {
    prompt += `Original UI uses:\n`
    prompt += `${JSON.stringify(request.uiMetadata, null, 2).slice(0, 1000)}\n\n`
  }

  prompt += `Source HTML to Modify:\n${request.sourceHtml}\n\n`
  prompt += `Generate the complete modified HTML document implementing this variant. Return ONLY the HTML.`

  return prompt
}

// Clean HTML response - remove markdown code blocks
function cleanHtmlChunk(text: string): string {
  let cleaned = text
  // Remove markdown code block markers if they appear
  cleaned = cleaned.replace(/^```html\n?/gm, '')
  cleaned = cleaned.replace(/^```\n?/gm, '')
  cleaned = cleaned.replace(/\n?```$/gm, '')
  return cleaned
}

// Stream with Anthropic
async function* streamWithAnthropic(apiKey: string, model: string, prompt: string): AsyncGenerator<string> {
  console.log('[streaming] Starting Anthropic stream')

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
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Anthropic API error')
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

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
          const event = JSON.parse(data)
          if (event.type === 'content_block_delta' && event.delta?.text) {
            yield cleanHtmlChunk(event.delta.text)
          }
        } catch {
          // Skip non-JSON lines
        }
      }
    }
  }
}

// Stream with OpenAI
async function* streamWithOpenAI(apiKey: string, model: string, prompt: string): AsyncGenerator<string> {
  console.log('[streaming] Starting OpenAI stream')

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
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API error')
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

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
          const event = JSON.parse(data)
          const content = event.choices?.[0]?.delta?.content
          if (content) {
            yield cleanHtmlChunk(content)
          }
        } catch {
          // Skip non-JSON lines
        }
      }
    }
  }
}

// Stream with Google
async function* streamWithGoogle(apiKey: string, model: string, prompt: string): AsyncGenerator<string> {
  console.log('[streaming] Starting Google stream')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:streamGenerateContent?key=${apiKey}&alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + prompt }] }],
        generationConfig: { maxOutputTokens: 16384 },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Google AI API error')
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

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
        try {
          const event = JSON.parse(data)
          const text = event.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            yield cleanHtmlChunk(text)
          }
        } catch {
          // Skip non-JSON lines
        }
      }
    }
  }
}

// Upload files to storage
async function uploadVariantFiles(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  sessionId: string,
  variantIndex: number,
  html: string
): Promise<{ htmlPath: string; htmlUrl: string }> {
  const htmlPath = `${userId}/${sessionId}/variant_${variantIndex}.html`

  const { error: uploadError } = await supabase.storage
    .from('vibe-files')
    .upload(htmlPath, new Blob([html], { type: 'text/html' }), {
      contentType: 'text/html',
      upsert: true,
    })

  if (uploadError) {
    console.error('[streaming] Storage upload error:', uploadError)
    throw new Error(`Failed to upload HTML to storage: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('vibe-files')
    .getPublicUrl(htmlPath)

  return {
    htmlPath,
    htmlUrl: urlData.publicUrl,
  }
}

Deno.serve(async (req) => {
  console.log('[streaming] Request received:', req.method)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  let parsedBody: GenerateCodeRequest | null = null

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
    console.log('[streaming] User authenticated:', user.id)

    // Parse request
    parsedBody = await req.json()
    const body = parsedBody
    console.log('[streaming] Generating variant', body.variantIndex, 'for session:', body.sessionId)

    if (!body.sessionId || !body.planId || !body.variantIndex || !body.plan || !body.sourceHtml) {
      throw new Error('Missing required fields')
    }

    // Update variant status to generating
    await supabase
      .from('vibe_variants')
      .upsert({
        session_id: body.sessionId,
        plan_id: body.planId,
        variant_index: body.variantIndex,
        html_path: '',
        html_url: '',
        status: 'generating',
      }, {
        onConflict: 'session_id,variant_index',
      })

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
    console.log('[streaming] Using provider:', keyConfig.provider, 'model:', modelToUse)

    // Get decrypted API key
    const { data: apiKey, error: decryptError } = await supabase
      .rpc('get_api_key', { p_user_id: user.id, p_provider: keyConfig.provider })

    if (decryptError || !apiKey) {
      throw new Error('Failed to retrieve API key')
    }

    // Build prompt
    const prompt = buildCodePrompt(body)

    // Create SSE response stream
    const encoder = new TextEncoder()
    let fullHtml = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Select streaming generator based on provider
          let generator: AsyncGenerator<string>
          switch (keyConfig.provider) {
            case 'anthropic':
              generator = streamWithAnthropic(apiKey, modelToUse, prompt)
              break
            case 'openai':
              generator = streamWithOpenAI(apiKey, modelToUse, prompt)
              break
            case 'google':
              generator = streamWithGoogle(apiKey, modelToUse, prompt)
              break
            default:
              throw new Error(`Unsupported provider: ${keyConfig.provider}`)
          }

          // Stream chunks to client
          for await (const chunk of generator) {
            fullHtml += chunk
            // Send SSE event with chunk
            const sseData = JSON.stringify({ type: 'chunk', content: chunk })
            controller.enqueue(encoder.encode(`data: ${sseData}\n\n`))
          }

          console.log('[streaming] Generation complete, HTML length:', fullHtml.length)

          // Validate generated HTML
          if (!fullHtml || fullHtml.length < 100) {
            throw new Error('Generated HTML is too short or empty')
          }

          // Upload to storage
          console.log('[streaming] Uploading to storage...')
          const { htmlPath, htmlUrl } = await uploadVariantFiles(
            supabase,
            user.id,
            body.sessionId,
            body.variantIndex,
            fullHtml
          )

          const duration = Date.now() - startTime

          // Update variant record
          const { error: saveError } = await supabase
            .from('vibe_variants')
            .upsert({
              session_id: body.sessionId,
              plan_id: body.planId,
              variant_index: body.variantIndex,
              html_path: htmlPath,
              html_url: htmlUrl,
              generation_model: modelToUse,
              generation_duration_ms: duration,
              status: 'complete',
            }, {
              onConflict: 'session_id,variant_index',
            })

          if (saveError) {
            console.error('[streaming] Failed to save variant:', saveError)
            throw new Error(`Failed to save variant: ${saveError.message}`)
          }

          // Check if all variants are complete
          const { data: allVariants } = await supabase
            .from('vibe_variants')
            .select('status')
            .eq('session_id', body.sessionId)

          const allComplete = allVariants?.length === 4 && allVariants.every(v => v.status === 'complete')
          if (allComplete) {
            await supabase
              .from('vibe_sessions')
              .update({ status: 'complete' })
              .eq('id', body.sessionId)
            console.log('[streaming] All variants complete, session marked complete')
          }

          // Send completion event
          const completeData = JSON.stringify({
            type: 'complete',
            htmlUrl,
            htmlPath,
            htmlLength: fullHtml.length,
            durationMs: duration,
            model: modelToUse,
            provider: keyConfig.provider,
          })
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`))

          console.log('[streaming] Variant', body.variantIndex, 'complete in', duration, 'ms')
          controller.close()

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('[streaming] Error:', errorMessage)

          // Update variant status to failed
          try {
            await supabase
              .from('vibe_variants')
              .update({ status: 'failed', error_message: errorMessage })
              .eq('session_id', body.sessionId)
              .eq('variant_index', body.variantIndex)
          } catch {
            console.error('[streaming] Failed to update variant status')
          }

          // Send error event
          const errorData = JSON.stringify({ type: 'error', error: errorMessage })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[streaming] Setup error:', errorMessage)

    // Try to update variant status to failed
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (supabaseUrl && supabaseServiceKey && parsedBody?.sessionId && parsedBody?.variantIndex) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        await supabase
          .from('vibe_variants')
          .update({ status: 'failed', error_message: errorMessage })
          .eq('session_id', parsedBody.sessionId)
          .eq('variant_index', parsedBody.variantIndex)
      }
    } catch {
      console.error('[streaming] Error during cleanup')
    }

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
