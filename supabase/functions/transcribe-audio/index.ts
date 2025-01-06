import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const HF_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audioUrl } = await req.json()
    console.log('Processing audio URL:', audioUrl)

    if (!audioUrl) {
      throw new Error('Audio URL is required')
    }

    // Fetch audio content
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`)
    }

    const audioBlob = await audioResponse.blob()
    console.log('Audio blob size:', audioBlob.size)

    // Send to Hugging Face for transcription
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('HUGGING_FACE_API_KEY')}`,
        'Content-Type': 'audio/wav',
      },
      body: audioBlob,
    })

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${await response.text()}`)
    }

    const result = await response.json()
    console.log('Transcription result:', result)

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Transcription error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})