import { useYoutubeVideos } from "@/hooks/useYoutubeVideos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface YouTubeChannel {
  id: string;
  categories: string[];
}

const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  {
    id: '@IdrissJAberkane',
    categories: ['Science', 'Politics', 'Economy', 'Technology', 'Culture']
  }
];

async function saveVideoToDatabase(video: any) {
  try {
    // Vérifier si la vidéo existe déjà
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_video_id', video.id)
      .maybeSingle();

    if (existingVideo) {
      console.log(`Video ${video.id} already exists, skipping`);
      return;
    }

    // Insérer la nouvelle vidéo
    const { data: newVideo, error: videoError } = await supabase
      .from('videos')
      .insert({
        youtube_video_id: video.id,
        title: video.title,
        summary: video.description,
        published_date: video.publishedAt,
        thumbnail_url: video.thumbnail,
        video_url: `https://www.youtube.com/watch?v=${video.id}`,
        categories: ['news'] // Sera mis à jour par le trigger analyze_video_categories
      })
      .select()
      .single();

    if (videoError) throw videoError;

    // Initialiser les statistiques de la vidéo
    await supabase
      .from('video_stats')
      .insert({
        video_id: newVideo.id,
        view_count: parseInt(video.statistics?.viewCount || '0', 10),
      });

    console.log(`Video ${video.id} saved successfully`);
  } catch (error) {
    console.error(`Error saving video ${video.id}:`, error);
    throw error;
  }
}

export async function addNewYouTubeChannel(channelId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-youtube-channel', {
      body: { 
        channelId,
        excludeShorts: true
      }
    });

    if (error) {
      console.error('Error analyzing channel:', error);
      toast.error("Erreur lors de l'analyse de la chaîne YouTube");
      return false;
    }

    // Pour chaque vidéo, sauvegarder dans la base de données
    for (const video of data.videos) {
      try {
        await saveVideoToDatabase(video);
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        toast.error(`Erreur lors du traitement de la vidéo ${video.title}`);
      }
    }

    toast.success("Chaîne YouTube ajoutée avec succès !");
    return true;
  } catch (error) {
    console.error('Error:', error);
    toast.error("Erreur lors de l'ajout de la chaîne");
    return false;
  }
}

export function useYouTubeVideos() {
  const channelsData = YOUTUBE_CHANNELS.map(channel => {
    const { data, isLoading } = useYoutubeVideos(channel.id);
    
    // Sauvegarder automatiquement les nouvelles vidéos
    if (data && !isLoading) {
      data.forEach(async (video) => {
        try {
          await saveVideoToDatabase(video);
        } catch (error) {
          console.error(`Error auto-saving video ${video.id}:`, error);
        }
      });
    }

    return {
      videos: data?.map(video => ({
        ...video,
        categories: video.categories || ['Actualités']
      })) || [],
      isLoading
    };
  });

  const allVideos = channelsData.flatMap(channel => channel.videos);
  const isLoading = channelsData.some(channel => channel.isLoading);

  return { videos: allVideos, isLoading };
}