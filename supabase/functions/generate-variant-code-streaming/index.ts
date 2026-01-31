// Supabase Edge Function for streaming variant HTML/CSS code generation
// Uses Server-Sent Events (SSE) to stream HTML chunks as LLM generates
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
  screenshotBase64?: string  // Base64-encoded screenshot of current screen
  uiMetadata?: Record<string, unknown>
  productContext?: string
  provider?: 'anthropic' | 'openai' | 'google'
  model?: string
}

// System prompt for code generation - emphasizes MODIFYING the existing HTML
const SYSTEM_PROMPT = `You are an expert front-end developer tasked with MODIFYING an existing HTML document.

CRITICAL: You are NOT creating a new design. You are taking the SOURCE HTML provided and making TARGETED MODIFICATIONS based on the variant plan. The source HTML is from a real, captured web application that the user wants to enhance.

## ABSOLUTE RULES:
1. START with the source HTML as your base - copy it first, then modify
2. PRESERVE the overall structure, layout, and content of the original
3. KEEP all existing elements, classes, IDs, and inline styles unless explicitly told to change them
4. PRESERVE all functionality (forms, links, scripts, event handlers)
5. Make ONLY the changes specified in the variant plan - nothing more
6. Return ONLY the complete modified HTML - no explanations, no markdown

## WHAT TO PRESERVE (unless plan says otherwise):
- Navigation structure and menu items
- Header/footer layout
- Content sections and their order
- Form fields and validation
- Images and their positioning
- All text content (only change if plan mentions it)
- All JavaScript and interactivity
- All CSS (inline, embedded, or referenced)

## HOW TO MODIFY:
- For style changes: Add/update inline styles on existing elements
- For color theme changes: Update color, background-color, border-color values
- For typography: Modify font properties on relevant elements
- For layout tweaks: Adjust flex, grid, padding, margin on containers
- For new components: INSERT them into logical positions within existing structure
- For removals: Only remove if explicitly stated in the plan

Think of yourself as making surgical edits to the source HTML, not rewriting it.

Start your response directly with <!DOCTYPE html> or <html>.`

function buildCodePrompt(request: GenerateCodeRequest): string {
  let prompt = `## SOURCE HTML (this is your base - modify it, don't replace it):\n`
  prompt += `\`\`\`html\n${request.sourceHtml}\n\`\`\`\n\n`

  prompt += `## MODIFICATIONS TO MAKE:\n`
  prompt += `Variant: ${request.plan.title}\n`
  prompt += `Description: ${request.plan.description}\n\n`
  prompt += `Apply these specific changes to the source HTML above:\n`
  prompt += `${request.plan.keyChanges.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n`

  if (request.plan.styleNotes) {
    prompt += `Style guidance: ${request.plan.styleNotes}\n\n`
  }

  if (request.productContext) {
    prompt += `Context about this product:\n${request.productContext.slice(0, 1500)}\n\n`
  }

  if (request.uiMetadata) {
    prompt += `The original UI includes: ${JSON.stringify(request.uiMetadata).slice(0, 500)}\n\n`
  }

  prompt += `## IMPORTANT REMINDERS:\n`
  prompt += `- Start with the source HTML above and make targeted modifications\n`
  prompt += `- Keep ALL existing content, structure, and functionality\n`
  prompt += `- Only change what's needed to implement the modifications listed\n`
  prompt += `- Return the complete modified HTML document, starting with <!DOCTYPE html> or <html>`

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

// Stream with Anthropic (with optional vision support)
async function* streamWithAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): AsyncGenerator<string> {
  console.log('[streaming] Calling Anthropic streaming API', screenshotBase64 ? 'with screenshot' : 'text only')

  // Build message content - text or text + image
  const content: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = []

  if (screenshotBase64) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: screenshotBase64,
      },
    })
    content.push({
      type: 'text',
      text: 'This is the current screen that needs to be modified. The HTML code for this screen is provided below.\n\n' + prompt,
    })
  } else {
    content.push({ type: 'text', text: prompt })
  }

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
          const parsed = JSON.parse(data)
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield parsed.delta.text
          }
        } catch {
          // Ignore parse errors for incomplete JSON
        }
      }
    }
  }
}

// Stream with OpenAI (with optional vision support)
async function* streamWithOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): AsyncGenerator<string> {
  console.log('[streaming] Calling OpenAI streaming API', screenshotBase64 ? 'with screenshot' : 'text only')

  // Build message content - text or text + image
  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = []

  if (screenshotBase64) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${screenshotBase64}`,
      },
    })
    content.push({
      type: 'text',
      text: 'This is the current screen that needs to be modified. The HTML code for this screen is provided below.\n\n' + prompt,
    })
  } else {
    content.push({ type: 'text', text: prompt })
  }

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
        { role: 'user', content },
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
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            yield content
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
}

// Stream with Google (Gemini) with optional vision support
async function* streamWithGoogle(
  apiKey: string,
  model: string,
  prompt: string,
  screenshotBase64?: string
): AsyncGenerator<string> {
  console.log('[streaming] Calling Google streaming API', screenshotBase64 ? 'with screenshot' : 'text only')

  // Build parts array - text or text + image
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = []

  if (screenshotBase64) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: screenshotBase64,
      },
    })
    parts.push({
      text: SYSTEM_PROMPT + '\n\nThis is the current screen that needs to be modified. The HTML code for this screen is provided below.\n\n' + prompt,
    })
  } else {
    parts.push({ text: SYSTEM_PROMPT + '\n\n' + prompt })
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}:streamGenerateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
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

    // Google returns JSON objects separated by newlines
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const parsed = JSON.parse(line)
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          yield text
        }
      } catch {
        // Ignore parse errors
      }
    }
  }
}

// Clean HTML response
function cleanHtmlResponse(html: string): string {
  let cleaned = html.trim()

  if (cleaned.startsWith('```html')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }

  return cleaned.trim()
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
    throw new Error(`Failed to upload HTML: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('vibe-files')
    .getPublicUrl(htmlPath)

  return { htmlPath, htmlUrl: urlData.publicUrl }
}

Deno.serve(async (req) => {
  console.log('[streaming] Request received:', req.method)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

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
    const body: GenerateCodeRequest = await req.json()
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

    // Log if screenshot is provided
    if (body.screenshotBase64) {
      console.log('[streaming] Screenshot provided, size:', Math.round(body.screenshotBase64.length / 1024), 'KB')
    }

    // Create SSE response stream
    const sse = createSSEEncoder()
    let fullHtml = ''
    let chunkCount = 0

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(sse.encodeObject('status', {
            stage: 'generating',
            variantIndex: body.variantIndex,
            message: `Starting generation for variant ${body.variantIndex}...`,
          }))

          // Get appropriate stream generator (with optional screenshot for vision)
          let streamGenerator: AsyncGenerator<string>
          switch (keyConfig.provider) {
            case 'anthropic':
              streamGenerator = streamWithAnthropic(apiKey, modelToUse, prompt, body.screenshotBase64)
              break
            case 'openai':
              streamGenerator = streamWithOpenAI(apiKey, modelToUse, prompt, body.screenshotBase64)
              break
            case 'google':
              streamGenerator = streamWithGoogle(apiKey, modelToUse, prompt, body.screenshotBase64)
              break
            default:
              throw new Error(`Unsupported provider: ${keyConfig.provider}`)
          }

          // Stream chunks
          for await (const chunk of streamGenerator) {
            fullHtml += chunk
            chunkCount++

            // Send chunk event
            controller.enqueue(sse.encodeObject('chunk', {
              variantIndex: body.variantIndex,
              chunk,
              totalLength: fullHtml.length,
            }))

            // Send progress update every 10 chunks
            if (chunkCount % 10 === 0) {
              controller.enqueue(sse.encodeObject('progress', {
                variantIndex: body.variantIndex,
                chunksReceived: chunkCount,
                htmlLength: fullHtml.length,
              }))

              // Save partial HTML to database periodically
              if (fullHtml.length > 5000) {
                await supabase
                  .from('vibe_variants')
                  .update({
                    partial_html: fullHtml,
                    partial_html_updated_at: new Date().toISOString(),
                  })
                  .eq('session_id', body.sessionId)
                  .eq('variant_index', body.variantIndex)
              }
            }
          }

          // Clean final HTML
          const cleanedHtml = cleanHtmlResponse(fullHtml)
          console.log('[streaming] Generation complete, HTML length:', cleanedHtml.length)

          // Upload to storage
          const { htmlPath, htmlUrl } = await uploadVariantFiles(
            supabase,
            user.id,
            body.sessionId,
            body.variantIndex,
            cleanedHtml
          )

          const duration = Date.now() - startTime

          // Update variant record
          await supabase
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
              partial_html: null,
              partial_html_updated_at: null,
            }, {
              onConflict: 'session_id,variant_index',
            })

          // Check if all variants complete
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
          }

          // Send complete event
          controller.enqueue(sse.encodeObject('complete', {
            variantIndex: body.variantIndex,
            htmlUrl,
            htmlPath,
            htmlLength: cleanedHtml.length,
            durationMs: duration,
            model: modelToUse,
            provider: keyConfig.provider,
            allVariantsComplete: allComplete,
          }))

          controller.close()

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('[streaming] Error:', errorMessage)

          // Update variant status to failed
          await supabase
            .from('vibe_variants')
            .update({ status: 'failed', error_message: errorMessage })
            .eq('session_id', body.sessionId)
            .eq('variant_index', body.variantIndex)

          // Send error event
          controller.enqueue(sse.encodeObject('error', {
            variantIndex: body.variantIndex,
            error: errorMessage,
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[streaming] Setup error:', errorMessage)

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
