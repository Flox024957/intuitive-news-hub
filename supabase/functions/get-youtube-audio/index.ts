import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import ytdl from 'npm:ytdl-core'

serve(async (req) => {
  try {
    const { videoId } = await req.json()
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const info = await ytdl.getInfo(videoId)
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    })

    return new Response(
      JSON.stringify({ audioUrl: audioFormat.url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})