import { useQuery } from "@tanstack/react-query";
import { fetchYouTubeData } from "@/utils/youtubeDataUtils";
import { saveVideoToDatabase } from "@/utils/videoPersistenceUtils";
import { toast } from "sonner";

export function useYouTubeVideos(username: string) {
  return useQuery({
    queryKey: ['youtube-videos', username],
    queryFn: async () => {
      try {
        console.log('Fetching videos for channel:', username);
        const videos = await fetchYouTubeData(username);
        console.log('YouTube videos fetched:', videos.length);

        // If we got videos, try to save them
        if (videos && videos.length > 0) {
          const savedVideos = await Promise.all(
            videos.map(async (video) => {
              try {
                const savedVideoId = await saveVideoToDatabase(video);
                console.log('Video processed successfully:', savedVideoId);
                return video;
              } catch (error) {
                console.error('Error processing video:', video.id, error);
                return video;
              }
            })
          );
          return savedVideos;
        }
        
        return [];
      } catch (error: any) {
        // Check for quota exceeded error
        if (error.message?.includes('quotaExceeded') || error.status === 429) {
          console.warn('YouTube API quota exceeded, using cached data only');
          toast.warning("Limite d'API YouTube atteinte, utilisation des données en cache", {
            duration: 5000,
          });
          return []; // Return empty array to fallback to database cache
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