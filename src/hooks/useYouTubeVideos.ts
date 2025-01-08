import { useQuery } from "@tanstack/react-query";
import { fetchYouTubeData } from "@/utils/youtubeDataUtils";
import { saveVideoToDatabase } from "@/utils/videoPersistenceUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useYouTubeVideos(username: string) {
  return useQuery({
    queryKey: ['youtube-videos', username],
    queryFn: async () => {
      try {
        // First, try to get cached videos from the database
        const { data: cachedVideos } = await supabase
          .from('videos')
          .select(`
            *,
            podcaster:podcasters(*),
            stats:video_stats(*)
          `)
          .order('published_date', { ascending: false });

        console.log('Cached videos found:', cachedVideos?.length || 0);

        // If we have cached videos, return them immediately
        if (cachedVideos?.length) {
          // Try to fetch fresh data in the background
          fetchYouTubeData(username).catch((error) => {
            if (error.message?.includes('quotaExceeded') || error.status === 429) {
              console.log('Using cached data due to quota limits');
            } else {
              console.error('Background fetch error:', error);
            }
          });

          return cachedVideos;
        }

        // If no cached data, try to fetch fresh data
        console.log('Fetching fresh YouTube data for:', username);
        const videos = await fetchYouTubeData(username);

        if (videos && videos.length > 0) {
          // Save to database in the background
          Promise.all(
            videos.map(async (video) => {
              try {
                await saveVideoToDatabase(video);
              } catch (error) {
                console.error('Error saving video:', video.id, error);
              }
            })
          ).catch(console.error);

          return videos;
        }

        return [];
      } catch (error: any) {
        // Handle quota exceeded error gracefully
        if (error.message?.includes('quotaExceeded') || error.status === 429) {
          console.warn('YouTube API quota exceeded, using cached data only');
          toast.warning("Limite d'API YouTube atteinte, utilisation des données en cache", {
            duration: 5000,
          });
          
          // Return cached data if available
          const { data: cachedVideos } = await supabase
            .from('videos')
            .select(`
              *,
              podcaster:podcasters(*),
              stats:video_stats(*)
            `)
            .order('published_date', { ascending: false });

          return cachedVideos || [];
        }
        
        console.error('Error in useYouTubeVideos:', error);
        toast.error("Erreur lors de la récupération des vidéos YouTube");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry if quota is exceeded
      if (error.message?.includes('quotaExceeded') || error.status === 429) {
        return false;
      }
      return failureCount < 2;
    }
  });
}