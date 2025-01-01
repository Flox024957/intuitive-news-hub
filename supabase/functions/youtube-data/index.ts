import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

async function getChannelIdFromUsername(username: string): Promise<string | null> {
  try {
    console.log('Recherche du channel ID pour username:', username);
    
    // Essai avec forUsername d'abord
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=id&forUsername=${username.replace('@', '')}&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    console.log('Réponse forUsername:', data);
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id;
    }
    
    // Si pas de résultat, essai avec la recherche
    const searchResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=id&type=channel&q=${username}&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchResponse.json();
    console.log('Réponse search:', searchData);
    
    if (searchData.items && searchData.items.length > 0) {
      return searchData.items[0].id.channelId;
    }
    
    throw new Error(`Impossible de trouver l'ID de la chaîne pour ${username}`);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID de la chaîne:', error);
    throw error;
  }
}

async function getChannelUploads(channelId: string) {
  console.log('Récupération des uploads pour channelId:', channelId);
  
  // Get the uploads playlist ID
  const channelResponse = await fetch(
    `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  );
  const channelData = await channelResponse.json();
  console.log('Données de la chaîne:', channelData);
  
  if (!channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
    throw new Error('Impossible de trouver la playlist des uploads');
  }
  
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
  
  // Get the videos from the uploads playlist
  const videosResponse = await fetch(
    `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
  );
  const videosData = await videosResponse.json();
  console.log('Nombre de vidéos trouvées:', videosData.items?.length || 0);
  
  if (!videosData.items) {
    throw new Error('Aucune vidéo trouvée');
  }
  
  // Get video statistics
  const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
  const statsResponse = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  );
  const statsData = await statsResponse.json();
  
  // Combine video data with statistics
  const videos = videosData.items.map((item: any) => {
    const stats = statsData.items.find((stat: any) => stat.id === item.snippet.resourceId.videoId);
    return {
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      statistics: stats?.statistics || {}
    };
  });
  
  return videos;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelId, username } = await req.json();
    console.log('Requête reçue:', { channelId, username });

    let finalChannelId = channelId;
    
    // Si on a un username mais pas de channelId, on récupère l'ID
    if (!channelId && username) {
      console.log('Recherche de l\'ID pour username:', username);
      finalChannelId = await getChannelIdFromUsername(username);
      console.log('ID de chaîne trouvé:', finalChannelId);
    }

    if (!finalChannelId) {
      return new Response(
        JSON.stringify({ error: "Channel ID requis" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const videos = await getChannelUploads(finalChannelId);
    
    return new Response(
      JSON.stringify({ videos }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})