import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCachedVideos, saveVideosToCache } from "./db.ts"
import { fetchYouTubeVideos } from "./youtube.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    console.log('Processing request for YouTube channel:', username);

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // First try to get cached videos
    const cachedVideos = await getCachedVideos();
    console.log('Found cached videos:', cachedVideos.length);
    
    try {
      // Try to fetch fresh data
      const freshVideos = await fetchYouTubeVideos(username);
      console.log('Successfully fetched', freshVideos.length, 'videos from YouTube');
      
      // Save the fresh videos to cache
      await saveVideosToCache(freshVideos);
      
      return new Response(
        JSON.stringify({ videos: freshVideos }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      if (error.message === 'quotaExceeded' || error.status === 429) {
        console.log('YouTube quota exceeded, using cached data');
        if (cachedVideos.length > 0) {
          return new Response(
            JSON.stringify({ 
              videos: cachedVideos,
              warning: 'Using cached data due to YouTube quota limits'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    const status = error.message === 'quotaExceeded' ? 429 : 500;
    const errorMessage = error.message === 'quotaExceeded' 
      ? 'YouTube API quota exceeded' 
      : 'Internal server error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message === 'quotaExceeded' ? error : undefined
      }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});