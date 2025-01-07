import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    console.log('Requête reçue pour username:', username);

    if (!username) {
      throw new Error('Username requis');
    }

    // Récupérer l'ID de la chaîne à partir du nom d'utilisateur
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&forUsername=${username.replace('@', '')}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();
    
    if (!channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
      throw new Error(`Impossible de trouver la chaîne pour ${username}`);
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Récupérer les vidéos de la playlist
    const videosResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosResponse.json();

    if (!videosData.items) {
      throw new Error('Aucune vidéo trouvée');
    }

    // Récupérer les statistiques des vidéos
    const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
    const statsResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const statsData = await statsResponse.json();

    // Combiner les données
    const videos = videosData.items.map((item: any) => {
      const stats = statsData.items?.find((stat: any) => stat.id === item.snippet.resourceId.videoId);
      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url,
        publishedAt: item.snippet.publishedAt,
        statistics: stats?.statistics || {}
      };
    });

    return new Response(
      JSON.stringify({ videos }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});