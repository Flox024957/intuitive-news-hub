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
    console.log('Received request for videoId:', videoId);
    
    if (!videoId) {
      console.error('No videoId provided in request');
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('Fetching video info for:', videoId);
    const info = await ytdl.getInfo(videoId)
    console.log('Got video info, selecting audio format');
    
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    })

    console.log('Selected audio format:', {
      quality: audioFormat.quality,
      container: audioFormat.container,
      hasAudio: audioFormat.hasAudio
    });

    return new Response(
      JSON.stringify({ audioUrl: audioFormat.url }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error in get-youtube-audio:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})