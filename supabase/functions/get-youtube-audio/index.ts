import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import ytdl from 'npm:ytdl-core'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoId } = await req.json()
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const info = await ytdl.getInfo(videoId)
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    })

    return new Response(
      JSON.stringify({ audioUrl: audioFormat.url }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error in get-youtube-audio:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})