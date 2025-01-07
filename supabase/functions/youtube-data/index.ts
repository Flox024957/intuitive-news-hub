import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    console.log('Processing request for YouTube channel:', username);

    if (!username) {
      throw new Error('Username is required');
    }

    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Get channel ID from username
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forUsername=${username.replace('@', '')}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelResponse.ok) {
      console.error('Error fetching channel:', await channelResponse.text());
      throw new Error('Failed to fetch channel data');
    }

    const channelData = await channelResponse.json();
    console.log('Channel data received:', channelData);
    
    if (!channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
      throw new Error(`Channel not found for ${username}`);
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const channelTitle = channelData.items[0].snippet.title;

    // Get videos from uploads playlist
    const videosResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      console.error('Error fetching videos:', await videosResponse.text());
      throw new Error('Failed to fetch videos');
    }

    const videosData = await videosResponse.json();
    console.log(`Found ${videosData.items?.length || 0} videos`);

    if (!videosData.items?.length) {
      return new Response(
        JSON.stringify({ videos: [], message: 'No videos found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get video statistics
    const videoIds = videosData.items
      .map((item: any) => item.snippet.resourceId.videoId)
      .join(',');

    const statsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!statsResponse.ok) {
      console.error('Error fetching stats:', await statsResponse.text());
      throw new Error('Failed to fetch video statistics');
    }

    const statsData = await statsResponse.json();
    console.log('Statistics received for', statsData.items?.length || 0, 'videos');

    // Combine video data with statistics
    const videos = videosData.items.map((item: any) => {
      const stats = statsData.items?.find((stat: any) => stat.id === item.snippet.resourceId.videoId);
      const snippet = item.snippet;
      
      return {
        id: snippet.resourceId.videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails.maxres?.url || 
                  snippet.thumbnails.standard?.url || 
                  snippet.thumbnails.high?.url,
        publishedAt: snippet.publishedAt,
        channelTitle: channelTitle,
        statistics: {
          viewCount: stats?.statistics?.viewCount || '0',
          likeCount: stats?.statistics?.likeCount || '0',
          commentCount: stats?.statistics?.commentCount || '0'
        },
        duration: stats?.contentDetails?.duration || 'PT0S'
      };
    });

    console.log('Successfully processed', videos.length, 'videos');

    return new Response(
      JSON.stringify({ videos }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      },
    );
  }
});