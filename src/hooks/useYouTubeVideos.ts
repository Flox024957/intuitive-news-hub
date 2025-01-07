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