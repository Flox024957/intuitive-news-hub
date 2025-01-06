import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { analyzeContent } from './utils/contentAnalyzer.ts'
import { processVideo } from './utils/videoProcessor.ts'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

async function getChannelVideos(channelId: string) {
  console.log('Récupération des uploads pour channelId:', channelId)
  
  // Get the uploads playlist ID
  const channelResponse = await fetch(
    `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
  )
  const channelData = await channelResponse.json()
  
  if (!channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
    throw new Error('Impossible de trouver la playlist des uploads')
  }
  
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads
  
  // Get the videos from the uploads playlist
  const videosResponse = await fetch(
    `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
  )
  const videosData = await videosResponse.json()
  
  if (!videosData.items) {
    throw new Error('Aucune vidéo trouvée')
  }
  
  // Get video statistics and details
  const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',')
  const statsResponse = await fetch(
    `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  )
  const statsData = await statsResponse.json()
  
  // Filter out Shorts (typically vertical videos with duration < 1 minute)
  return videosData.items
    .map((item: any) => {
      const stats = statsData.items.find((stat: any) => stat.id === item.snippet.resourceId.videoId)
      if (!stats) return null

      const duration = stats.contentDetails.duration
      const durationInSeconds = parseDuration(duration)
      const isShort = durationInSeconds < 60 && stats.contentDetails.dimension === 'square'

      if (isShort) return null

      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        statistics: stats.statistics || {}
      }
    })
    .filter(Boolean)
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  const hours = (parseInt(match?.[1] ?? '0')) || 0
  const minutes = (parseInt(match?.[2] ?? '0')) || 0
  const seconds = (parseInt(match?.[3] ?? '0')) || 0
  return hours * 3600 + minutes * 60 + seconds
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
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    )
    const channelData = await channelResponse.json()
    const channelInfo = channelData.items[0].snippet

    // Créer ou mettre à jour le podcaster
    let podcasterId = existingPodcaster?.id
    if (!existingPodcaster) {
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
    console.log(`Traitement de ${videos.length} vidéos non-shorts`)
    
    // Traiter chaque vidéo
    for (const video of videos) {
      await processVideo(video, podcasterId, supabase)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Chaîne analysée et vidéos catégorisées avec succès',
        videoCount: videos.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})