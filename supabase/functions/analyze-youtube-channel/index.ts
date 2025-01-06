import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

interface VideoData {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnail: string
  statistics: {
    viewCount: string
    likeCount: string
  }
}

// Mots-clés pour la catégorisation
const categoryKeywords = {
  politics: [
    "politique", "gouvernement", "élection", "président", "ministre", "assemblée",
    "parlement", "démocratie", "loi", "réforme", "état"
  ],
  economy: [
    "économie", "finance", "marché", "entreprise", "croissance", "inflation",
    "investissement", "bourse", "budget", "commerce", "emploi"
  ],
  science: [
    "science", "recherche", "découverte", "étude", "laboratoire", "expérience",
    "scientifique", "biologie", "physique", "chimie", "théorie"
  ],
  technology: [
    "technologie", "innovation", "numérique", "intelligence artificielle", "ia",
    "robot", "internet", "digital", "informatique", "tech", "application"
  ],
  culture: [
    "culture", "art", "musique", "cinéma", "littérature", "théâtre",
    "exposition", "spectacle", "festival", "patrimoine", "histoire"
  ],
  news: [
    "actualité", "information", "news", "journal", "média", "reportage",
    "événement", "direct", "breaking", "dernière minute"
  ]
}

function analyzeContent(title: string, description: string): string[] {
  const content = (title + " " + description).toLowerCase()
  const categories: string[] = []

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        categories.push(category)
        break
      }
    }
  }

  // Si aucune catégorie n'est trouvée, on met par défaut "news"
  return categories.length > 0 ? categories : ["news"]
}

async function getChannelVideos(channelId: string): Promise<VideoData[]> {
  // Récupérer l'ID de la playlist "uploads" de la chaîne
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  )
  const channelData = await channelResponse.json()
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

  // Récupérer les vidéos de la playlist
  const playlistResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
  )
  const playlistData = await playlistResponse.json()

  // Récupérer les statistiques pour chaque vidéo
  const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',')
  const statsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  )
  const statsData = await statsResponse.json()

  return playlistData.items.map((item: any, index: number) => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails.high.url,
    statistics: statsData.items[index].statistics
  }))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { channelId } = await req.json()
    
    if (!channelId) {
      throw new Error('Channel ID is required')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
    
    // Vérifier si le podcaster existe déjà
    const { data: existingPodcaster } = await supabase
      .from('podcasters')
      .select('id')
      .eq('youtube_channel_id', channelId)
      .single()

    // Récupérer les informations de la chaîne
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )
    const channelData = await channelResponse.json()
    const channelInfo = channelData.items[0].snippet

    // Créer ou mettre à jour le podcaster
    let podcasterId
    if (existingPodcaster) {
      podcasterId = existingPodcaster.id
    } else {
      const { data: newPodcaster } = await supabase
        .from('podcasters')
        .insert({
          youtube_channel_id: channelId,
          name: channelInfo.title,
          description: channelInfo.description,
          profile_picture_url: channelInfo.thumbnails.high.url
        })
        .select()
        .single()
      podcasterId = newPodcaster!.id
    }

    // Récupérer et analyser les vidéos
    const videos = await getChannelVideos(channelId)
    
    // Insérer les vidéos dans la base de données
    for (const video of videos) {
      const categories = analyzeContent(video.title, video.description)
      
      // Vérifier si la vidéo existe déjà
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_video_id', video.id)
        .single()

      if (!existingVideo) {
        // Insérer la nouvelle vidéo
        const { data: newVideo } = await supabase
          .from('videos')
          .insert({
            youtube_video_id: video.id,
            title: video.title,
            summary: video.description,
            published_date: video.publishedAt,
            thumbnail_url: video.thumbnail,
            podcaster_id: podcasterId,
            video_url: `https://www.youtube.com/watch?v=${video.id}`,
            categories: categories
          })
          .select()
          .single()

        // Créer les statistiques initiales
        if (newVideo) {
          await supabase
            .from('video_stats')
            .insert({
              video_id: newVideo.id,
              view_count: parseInt(video.statistics.viewCount),
              like_count: parseInt(video.statistics.likeCount)
            })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Channel analyzed and videos categorized successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})