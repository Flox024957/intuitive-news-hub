import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type YouTubeVideo } from "@/types/video";

export function useYouTubeVideos(username: string) {
  return useQuery({
    queryKey: ['youtube-videos', username],
    queryFn: async () => {
      try {
        console.log('Fetching YouTube data for:', username);
        
        // Appeler l'edge function youtube-data
        const { data: youtubeData, error: youtubeError } = await supabase.functions.invoke(
          'youtube-data',
          {
            body: { username }
          }
        );

        if (youtubeError) {
          console.error('Error fetching YouTube data:', youtubeError);
          toast.error("Erreur lors de la récupération des vidéos YouTube");
          return [];
        }

        if (!youtubeData?.videos) {
          console.log('No videos found for channel:', username);
          return [];
        }

        // Sauvegarder les nouvelles vidéos dans la base de données
        for (const video of youtubeData.videos) {
          const { data: existingVideo } = await supabase
            .from('videos')
            .select('id')
            .eq('youtube_video_id', video.id)
            .maybeSingle();

          if (!existingVideo) {
            const { error: insertError } = await supabase
              .from('videos')
              .insert({
                youtube_video_id: video.id,
                title: video.title,
                summary: video.description,
                published_date: video.publishedAt,
                thumbnail_url: video.thumbnail,
                video_url: `https://www.youtube.com/watch?v=${video.id}`,
                categories: ['news']  // Le trigger analyze_video_categories mettra à jour les catégories
              });

            if (insertError) {
              console.error('Error saving video:', insertError);
            }
          }
        }

        console.log('YouTube videos fetched:', youtubeData.videos.length);
        return youtubeData.videos as YouTubeVideo[];

      } catch (error) {
        console.error('Error in useYouTubeVideos:', error);
        toast.error("Erreur lors du traitement des vidéos");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });
}