import { SupabaseClient } from '@supabase/supabase-js'

export async function processVideo(
  video: any,
  podcasterId: string,
  supabase: SupabaseClient
) {
  try {
    // Vérifier si la vidéo existe déjà
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_video_id', video.id)
      .single()

    if (existingVideo) {
      console.log(`Vidéo ${video.id} déjà existante, passage à la suivante`)
      return
    }

    // 1. Créer l'entrée vidéo
    const categories = analyzeContent(video.title, video.description)
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

    if (!newVideo) {
      throw new Error(`Échec de la création de la vidéo ${video.id}`)
    }

    // 2. Créer les statistiques initiales
    await supabase
      .from('video_stats')
      .insert({
        video_id: newVideo.id,
        view_count: parseInt(video.statistics.viewCount) || 0,
        like_count: parseInt(video.statistics.likeCount) || 0
      })

    // 3. Obtenir la transcription
    const { data: transcriptionResult } = await supabase.functions.invoke('transcribe-with-whisper', {
      body: { videoId: video.id }
    })

    if (transcriptionResult?.text) {
      // 4. Générer le résumé
      const { data: summaryResult } = await supabase.functions.invoke('generate-summary', {
        body: { text: transcriptionResult.text }
      })

      // 5. Générer l'article
      const { data: articleResult } = await supabase.functions.invoke('generate-article', {
        body: { 
          transcript: transcriptionResult.text,
          title: video.title,
          summary: summaryResult?.summary || video.description
        }
      })

      // 6. Mettre à jour la vidéo avec le contenu généré
      await supabase
        .from('videos')
        .update({
          full_transcript: transcriptionResult.text,
          summary: summaryResult?.summary || video.description,
          article_content: articleResult?.article
        })
        .eq('id', newVideo.id)
    }

    console.log(`Vidéo ${video.id} traitée avec succès`)
  } catch (error) {
    console.error(`Erreur lors du traitement de la vidéo ${video.id}:`, error)
    throw error
  }
}

function analyzeContent(title: string, description: string): string[] {
  const content = (title + " " + description).toLowerCase()
  const categories = new Set<string>()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        categories.add(category)
        break
      }
    }
  }

  return categories.size > 0 ? Array.from(categories) : ["News"]
}