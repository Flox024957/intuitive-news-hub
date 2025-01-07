import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type YouTubeVideo } from "@/types/video";

async function fetchYouTubeData(username: string): Promise<YouTubeVideo[]> {
  console.log('Fetching YouTube data for:', username);
  
  const { data: youtubeData, error: youtubeError } = await supabase.functions.invoke(
    'youtube-data',
    {
      body: { username }
    }
  );

  if (youtubeError) {
    console.error('Error fetching YouTube data:', youtubeError);
    throw new Error("Erreur lors de la récupération des vidéos YouTube");
  }

  if (!youtubeData?.videos) {
    console.log('No videos found for channel:', username);
    return [];
  }

  return youtubeData.videos;
}

async function analyzeVideoContent(title: string, description: string) {
  const { data: analysisData } = await supabase.functions.invoke(
    'analyze-video-tags',
    {
      body: {
        title,
        description,
        summary: null
      }
    }
  );

  return analysisData?.categories || ['news'];
}

async function saveVideoToDatabase(video: YouTubeVideo) {
  try {
    // Vérifier si la vidéo existe déjà
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_video_id', video.id)
      .maybeSingle();

    if (existingVideo) {
      console.log(`Video ${video.id} already exists`);
      return existingVideo.id;
    }

    // Analyser le contenu pour les catégories
    const categories = await analyzeVideoContent(video.title, video.description);
    console.log('Categories detected:', categories);

    // Insérer la nouvelle vidéo
    const { error: insertError } = await supabase
      .from('videos')
      .insert({
        youtube_video_id: video.id,
        title: video.title,
        summary: video.description,
        published_date: video.publishedAt,
        thumbnail_url: video.thumbnail,
        video_url: `https://www.youtube.com/watch?v=${video.id}`,
        categories: categories.slice(0, 3)
      });

    if (insertError) {
      console.error('Error saving video:', insertError);
      throw insertError;
    }

    // Récupérer l'ID de la vidéo insérée
    const { data: newVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_video_id', video.id)
      .single();

    if (!newVideo) {
      throw new Error("Impossible de récupérer l'ID de la vidéo insérée");
    }

    // Initialiser les statistiques de la vidéo
    await supabase
      .from('video_stats')
      .insert({
        video_id: newVideo.id,
        view_count: parseInt(video.statistics?.viewCount || '0', 10),
        like_count: parseInt(video.statistics?.likeCount || '0', 10),
        share_count: 0
      });

    console.log('Video saved successfully:', newVideo.id);
    return newVideo.id;
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
}

export function useYouTubeVideos(username: string) {
  return useQuery({
    queryKey: ['youtube-videos', username],
    queryFn: async () => {
      try {
        const videos = await fetchYouTubeData(username);
        console.log('YouTube videos fetched:', videos.length);

        // Traiter chaque vidéo
        for (const video of videos) {
          try {
            await saveVideoToDatabase(video);
          } catch (error) {
            console.error('Error processing video:', error);
            continue;
          }
        }

        return videos;
      } catch (error) {
        console.error('Error in useYouTubeVideos:', error);
        toast.error("Erreur lors du traitement des vidéos");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
}