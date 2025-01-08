import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";

type YouTubeChannel = {
  id: string;
  categories: string[];
};

const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  {
    id: '@IdrissJAberkane',
    categories: ['Science', 'Politics', 'Economy', 'Technology', 'Culture']
  }
];

async function saveVideoToDatabase(video: any) {
  try {
    console.log('Saving video to database:', video.id);
    
    // Check if video already exists using maybeSingle()
    const { data: existingVideo, error: checkError } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_video_id', video.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking video existence:', checkError);
      throw checkError;
    }

    if (existingVideo) {
      console.log(`Video ${video.id} already exists`);
      return existingVideo.id;
    }

    // Insert new video
    const { data: newVideo, error: videoError } = await supabase
      .from('videos')
      .insert({
        youtube_video_id: video.id,
        title: video.title,
        summary: video.description,
        published_date: video.publishedAt,
        thumbnail_url: video.thumbnail,
        video_url: `https://www.youtube.com/watch?v=${video.id}`,
        categories: video.categories || ['news']
      })
      .select()
      .single();

    if (videoError) {
      console.error('Error saving video:', videoError);
      throw videoError;
    }

    console.log('Video saved successfully:', newVideo.id);

    // Initialize video stats
    const { error: statsError } = await supabase
      .from('video_stats')
      .insert({
        video_id: newVideo.id,
        view_count: parseInt(video.statistics?.viewCount || '0', 10),
      });

    if (statsError) {
      console.error('Error saving video stats:', statsError);
    }

    return newVideo.id;
  } catch (error) {
    console.error(`Error processing video ${video.id}:`, error);
    toast.error("Erreur lors du traitement de la vidéo");
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
      // Check for quota exceeded error
      if (error.message?.includes('quotaExceeded') || error.status === 429) {
        console.warn('YouTube API quota exceeded');
        toast.warning("Limite d'API YouTube atteinte, réessayez plus tard", {
          duration: 5000,
        });
        return false;
      }

      console.error('Error analyzing channel:', error);
      toast.error("Erreur lors de l'analyse de la chaîne YouTube");
      return false;
    }

    // Save each video to the database
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
  } catch (error: any) {
    // Check for quota exceeded error
    if (error.message?.includes('quotaExceeded') || error.status === 429) {
      console.warn('YouTube API quota exceeded');
      toast.warning("Limite d'API YouTube atteinte, réessayez plus tard", {
        duration: 5000,
      });
      return false;
    }

    console.error('Error:', error);
    toast.error("Erreur lors de l'ajout de la chaîne");
    return false;
  }
}

export function useYouTubeChannelsVideos() {
  const channelsData = YOUTUBE_CHANNELS.map(channel => {
    const { data, isLoading } = useYouTubeVideos(channel.id);
    return {
      videos: data || [],
      isLoading
    };
  });

  const allVideos = channelsData.flatMap(channel => channel.videos);
  const isLoading = channelsData.some(channel => channel.isLoading);

  return { videos: allVideos, isLoading };
}