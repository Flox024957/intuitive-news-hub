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

    // Pour chaque vidéo, traiter le contenu (transcription, résumé, article)
    for (const video of data.videos) {
      try {
        // Analyze video categories using AI
        const { data: categoryData, error: categoryError } = await supabase.functions.invoke('analyze-video-tags', {
          body: { 
            title: video.title,
            description: video.description
          }
        });

        if (categoryError) {
          console.error('Error analyzing categories:', categoryError);
          continue;
        }

        const { data: transcriptionData } = await supabase.functions.invoke('transcribe-video', {
          body: { videoId: video.id }
        });

        if (transcriptionData?.transcript) {
          const { data: summaryData } = await supabase.functions.invoke('generate-summary', {
            body: { 
              text: transcriptionData.transcript,
              videoId: video.id
            }
          });

          const { data: articleData } = await supabase.functions.invoke('generate-article', {
            body: {
              transcript: transcriptionData.transcript,
              summary: summaryData?.summary,
              videoId: video.id
            }
          });

          console.log(`Content generated for video ${video.id}:`, {
            categories: categoryData?.categories,
            transcription: !!transcriptionData?.transcript,
            summary: !!summaryData?.summary,
            article: !!articleData?.article
          });
        }
      } catch (processError) {
        console.error(`Error processing video ${video.id}:`, processError);
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
    return {
      videos: data?.map(video => ({
        ...video,
        categories: video.categories || ['News'] // Fallback category if none assigned
      })) || [],
      isLoading
    };
  });

  const allVideos = channelsData.flatMap(channel => channel.videos);
  const isLoading = channelsData.some(channel => channel.isLoading);

  return { videos: allVideos, isLoading };
}