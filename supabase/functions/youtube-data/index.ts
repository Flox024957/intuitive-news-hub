import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json()
    console.log('Processing request for YouTube channel:', username)

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not configured')
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get channel ID from username or handle
    const searchQuery = username.startsWith('@') ? username.substring(1) : username
    console.log('Searching for channel with query:', searchQuery)
    
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&key=${YOUTUBE_API_KEY}`
    )

    const channelData = await channelResponse.json()
    
    // Check for quota exceeded error
    if (channelData.error?.errors?.some((e: any) => e.reason === 'quotaExceeded')) {
      console.error('YouTube API quota exceeded');
      return new Response(
        JSON.stringify({ 
          error: 'YouTube API quota exceeded',
          details: channelData.error 
        }),
        { 
          status: 429, // Too Many Requests
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text()
      console.error('Error fetching channel:', errorText)
      throw new Error(`Failed to fetch channel data: ${errorText}`)
    }

    const channelId = channelData.items?.[0]?.id?.channelId
    if (!channelId) {
      console.error('No channel found for:', username)
      return new Response(
        JSON.stringify({ error: `Channel not found for ${username}` }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get uploads playlist ID
    console.log('Fetching channel details for ID:', channelId)
    const channelDetailsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )

    if (!channelDetailsResponse.ok) {
      const errorText = await channelDetailsResponse.text()
      console.error('Error fetching channel details:', errorText)
      throw new Error(`Failed to fetch channel details: ${errorText}`)
    }

    const channelDetails = await channelDetailsResponse.json()
    console.log('Channel details received:', channelDetails)
    
    const uploadsPlaylistId = channelDetails.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    const channelTitle = channelDetails.items?.[0]?.snippet?.title

    if (!uploadsPlaylistId) {
      console.error('No uploads playlist found for channel:', channelId)
      return new Response(
        JSON.stringify({ error: 'Could not find uploads playlist' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get videos from uploads playlist
    console.log('Fetching videos from playlist:', uploadsPlaylistId)
    const videosResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    )

    if (!videosResponse.ok) {
      const errorText = await videosResponse.text()
      console.error('Error fetching videos:', errorText)
      throw new Error(`Failed to fetch videos: ${errorText}`)
    }

    const videosData = await videosResponse.json()
    console.log(`Found ${videosData.items?.length || 0} videos`)

    if (!videosData.items?.length) {
      return new Response(
        JSON.stringify({ videos: [], message: 'No videos found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get video statistics
    const videoIds = videosData.items
      .map((item: any) => item.snippet.resourceId.videoId)
      .join(',')

    console.log('Fetching statistics for videos:', videoIds)
    const statsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text()
      console.error('Error fetching stats:', errorText)
      throw new Error(`Failed to fetch video statistics: ${errorText}`)
    }

    const statsData = await statsResponse.json()
    console.log('Statistics received for', statsData.items?.length || 0, 'videos')

    // Combine video data
    const videos = videosData.items
      .map((item: any) => {
        const stats = statsData.items?.find((stat: any) => stat.id === item.snippet.resourceId.videoId)
        if (!stats) return null

        const snippet = item.snippet
        return {
          id: snippet.resourceId.videoId,
          title: snippet.title,
          description: snippet.description,
          thumbnail: snippet.thumbnails.maxres?.url || 
                    snippet.thumbnails.standard?.url || 
                    snippet.thumbnails.high?.url,
          publishedAt: snippet.publishedAt,
          channelTitle: channelTitle,
          statistics: stats.statistics,
          duration: stats.contentDetails?.duration
        }
      })
      .filter(Boolean)

    console.log('Successfully processed', videos.length, 'videos')

    return new Response(
      JSON.stringify({ videos }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message?.includes('quota') ? 429 : 500
      }
    )
  }
})
