import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HF_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3"

serve(async (req) => {
  // Handle CORS preflight requests
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
        'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: audioBlob,
        parameters: {
          return_timestamps: true
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', errorText)
      throw new Error(`Hugging Face API error: ${errorText}`)
    }

    const result = await response.json()
    console.log('Transcription completed successfully')

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