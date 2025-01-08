import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubeResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: {
        high: { url: string };
      };
    };
    statistics?: {
      viewCount: string;
      likeCount: string;
    };
  }>;
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, channelId } = await req.json();
    console.log('Processing request for:', { username, channelId });

    if (!username && !channelId) {
      throw new Error('Either username or channelId is required');
    }

    // D'abord obtenir l'ID de la chaîne si on a un nom d'utilisateur
    let finalChannelId = channelId;
    if (!channelId && username) {
      const channelResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!channelResponse.ok) {
        const error = await channelResponse.json();
        console.error('Channel fetch error:', error);
        throw new Error(`Failed to fetch channel data: ${error.error?.message || 'Unknown error'}`);
      }

      const channelData = await channelResponse.json();
      finalChannelId = channelData.items?.[0]?.id;
      
      if (!finalChannelId) {
        throw new Error('Channel not found');
      }
    }

    // Obtenir les vidéos de la chaîne
    const videosResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${finalChannelId}&maxResults=50&order=date&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      const error = await videosResponse.json();
      console.error('Videos fetch error:', error);
      throw new Error(`Failed to fetch videos: ${error.error?.message || 'Unknown error'}`);
    }

    const videosData = await videosResponse.json();
    
    // Obtenir les statistiques pour chaque vidéo
    const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',');
    const statsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!statsResponse.ok) {
      const error = await statsResponse.json();
      console.error('Stats fetch error:', error);
      throw new Error(`Failed to fetch video statistics: ${error.error?.message || 'Unknown error'}`);
    }

    const statsData = await statsResponse.json();

    // Combiner les données
    const videos = videosData.items.map((item: any) => {
      const stats = statsData.items.find((stat: any) => stat.id === item.id.videoId);
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        statistics: stats?.statistics
      };
    });

    console.log(`Successfully processed ${videos.length} videos`);

    return new Response(
      JSON.stringify({ videos }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in youtube-data function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});