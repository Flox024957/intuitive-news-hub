import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { channelId } = await req.json()

    if (!channelId) {
      throw new Error('Channel ID is required')
    }

    console.log(`Fetching videos for channel: ${channelId}`)

    // Get channel uploads playlist ID
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )
    const channelData = await channelResponse.json()
    
    if (!channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
      throw new Error('Channel not found or no uploads playlist available')
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

    // Get videos from uploads playlist
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    )
    const videosData = await videosResponse.json()

    if (!videosData.items) {
      throw new Error('No videos found')
    }

    // Format video data
    const videos = videosData.items.map((item: any) => ({
      youtube_video_id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      published_date: item.snippet.publishedAt,
      thumbnail_url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    }))

    // Get video statistics
    const videoIds = videos.map((v: any) => v.youtube_video_id).join(',')
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )
    const statsData = await statsResponse.json()

    // Merge statistics with video data
    const videosWithStats = videos.map((video: any) => {
      const stats = statsData.items.find((item: any) => item.id === video.youtube_video_id)?.statistics
      return {
        ...video,
        view_count: stats?.viewCount ? parseInt(stats.viewCount) : 0,
        like_count: stats?.likeCount ? parseInt(stats.likeCount) : 0,
      }
    })

    return new Response(
      JSON.stringify({ videos: videosWithStats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in youtube-data function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})