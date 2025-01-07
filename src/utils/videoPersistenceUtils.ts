import { type YouTubeVideo } from "@/types/video";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function analyzeVideoContent(title: string, description: string) {
  try {
    console.log('Analyzing content for:', { title, description });
    
    const { data: analysisData, error } = await supabase.functions.invoke(
      'analyze-video-tags',
      {
        body: {
          title,
          description,
          summary: null
        }
      }
    );

    if (error) {
      console.error('Error analyzing video content:', error);
      return ['news'];
    }

    return analysisData?.categories || ['news'];
  } catch (error) {
    console.error('Error in analyzeVideoContent:', error);
    return ['news'];
  }
}

export async function saveVideoToDatabase(video: YouTubeVideo) {
  try {
    console.log('Starting video save process:', video.id);
    
    // Vérifier si la vidéo existe déjà
    const { data: existingVideo, error: checkError } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_video_id', video.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking video existence:', checkError);
      throw new Error(`Erreur lors de la vérification de la vidéo: ${checkError.message}`);
    }

    if (existingVideo) {
      console.log(`Video ${video.id} already exists, skipping`);
      return existingVideo.id;
    }

    // Analyser le contenu pour déterminer les catégories
    const categories = await analyzeVideoContent(video.title, video.description);
    console.log('Analyzed categories:', categories);

    // Insérer la nouvelle vidéo
    const { data: newVideo, error: insertError } = await supabase
      .from('videos')
      .insert({
        youtube_video_id: video.id,
        title: video.title,
        summary: video.description,
        published_date: video.publishedAt,
        thumbnail_url: video.thumbnail,
        video_url: `https://www.youtube.com/watch?v=${video.id}`,
        categories: categories
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting video:', insertError);
      throw new Error(`Erreur lors de l'insertion de la vidéo: ${insertError.message}`);
    }

    console.log('Video saved successfully:', newVideo.id);

    // Initialiser les statistiques de la vidéo
    const { error: statsError } = await supabase
      .from('video_stats')
      .insert({
        video_id: newVideo.id,
        view_count: parseInt(video.statistics?.viewCount || '0', 10),
        like_count: parseInt(video.statistics?.likeCount || '0', 10),
        share_count: 0
      });

    if (statsError) {
      console.error('Error initializing video stats:', statsError);
      // On ne throw pas d'erreur ici car ce n'est pas critique
      toast.error("Attention: Les statistiques n'ont pas pu être initialisées");
    }

    return newVideo.id;
  } catch (error) {
    console.error('Error in saveVideoToDatabase:', error);
    toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde de la vidéo");
    throw error;
  }
}