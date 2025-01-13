import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import { type Video, type YouTubeVideo, type NormalizedVideo } from "@/types/video";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

async function saveVideoToDatabase(video: YouTubeVideo): Promise<string> {
  try {
    console.log('Saving video to database:', video.id);
    
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
      videos: data as NormalizedVideo[],
      isLoading
    };
  });

  const allVideos = channelsData.flatMap(channel => channel.videos || []);
  const isLoading = channelsData.some(channel => channel.isLoading);

  return { videos: allVideos as NormalizedVideo[], isLoading };
}

export function BatchProcessButton() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBatchProcess = async () => {
    try {
      setIsProcessing(true);
      toast.info("Démarrage du traitement des vidéos...");

      const { data, error } = await supabase.functions.invoke('batch-process-videos');

      if (error) {
        console.error('Error processing videos:', error);
        toast.error("Erreur lors du traitement des vidéos");
        return;
      }

      console.log('Batch processing results:', data);
      toast.success(`${data.processed} vidéos ont été traitées avec succès !`);

    } catch (error) {
      console.error('Error:', error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleBatchProcess}
      disabled={isProcessing}
      className="w-full"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Traitement en cours...
        </>
      ) : (
        "Traiter toutes les vidéos avec l'IA"
      )}
    </Button>
  );
}