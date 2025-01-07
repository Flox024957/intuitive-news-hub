import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

serve(async (req) => {
  // Always handle OPTIONS request first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get channel ID from username or handle
    const searchQuery = username.startsWith('@') ? username.substring(1) : username;
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${searchQuery}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelResponse.ok) {
      console.error('Error fetching channel:', await channelResponse.text());
      throw new Error('Failed to fetch channel data');
    }

    const channelData = await channelResponse.json();
    const channelId = channelData.items?.[0]?.id?.channelId;
    
    if (!channelId) {
      throw new Error(`Channel not found for ${username}`);
    }

    // Get uploads playlist ID
    const channelDetailsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelDetailsResponse.ok) {
      console.error('Error fetching channel details:', await channelDetailsResponse.text());
      throw new Error('Failed to fetch channel details');
    }

    const channelDetails = await channelDetailsResponse.json();
    const uploadsPlaylistId = channelDetails.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    const channelTitle = channelDetails.items?.[0]?.snippet?.title;

    if (!uploadsPlaylistId) {
      throw new Error('Could not find uploads playlist');
    }

    console.log('Found channel:', {
      title: channelTitle,
      id: channelId,
      uploadsPlaylistId
    });

    // Get videos from uploads playlist
    const videosResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
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

    // Get video statistics and content details
    const videoIds = videosData.items
      .map((item: any) => item.snippet.resourceId.videoId)
      .join(',');

    const statsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!statsResponse.ok) {
      console.error('Error fetching stats:', await statsResponse.text());
      throw new Error('Failed to fetch video statistics');
    }

    const statsData = await statsResponse.json();
    console.log('Statistics received for', statsData.items?.length || 0, 'videos');

    // Filter out shorts and combine video data
    const videos = videosData.items
      .map((item: any) => {
        const stats = statsData.items?.find((stat: any) => stat.id === item.snippet.resourceId.videoId);
        if (!stats) return null;

        // Parse duration to seconds
        const duration = stats.contentDetails?.duration || 'PT0S';
        const durationInSeconds = parseDuration(duration);

        // Skip shorts (videos under 60 seconds)
        if (durationInSeconds < 60) {
          console.log(`Skipping short video: ${item.snippet.title} (${durationInSeconds}s)`);
          return null;
        }

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
            viewCount: stats.statistics?.viewCount || '0',
            likeCount: stats.statistics?.likeCount || '0',
            commentCount: stats.statistics?.commentCount || '0'
          },
          duration: stats.contentDetails?.duration,
          durationInSeconds
        };
      })
      .filter(Boolean);

    console.log('Successfully processed', videos.length, 'videos (excluding shorts)');

    return new Response(
      JSON.stringify({ videos }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
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
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: error.status || 500,
      },
    );
  }
});

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return (hours * 3600) + (minutes * 60) + seconds;
}
