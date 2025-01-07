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

        const savedVideos = await Promise.all(
          videos.map(async (video) => {
            try {
              const savedVideoId = await saveVideoToDatabase(video);
              console.log('Video processed successfully:', savedVideoId);
              return video;
            } catch (error) {
              console.error('Error processing video:', video.id, error);
              // On continue avec la vidéo même si elle n'a pas pu être sauvegardée
              return video;
            }
          })
        );

        if (savedVideos.length === 0) {
          toast.warning("Aucune vidéo trouvée pour cette chaîne");
        }

        return savedVideos;
      } catch (error) {
        console.error('Error in useYouTubeVideos:', error);
        toast.error("Erreur lors de la récupération des vidéos YouTube");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
}