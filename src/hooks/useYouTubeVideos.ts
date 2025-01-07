import { useQuery } from "@tanstack/react-query";
import { fetchYouTubeData } from "@/utils/youtubeDataUtils";
import { saveVideoToDatabase } from "@/utils/videoPersistenceUtils";
import { toast } from "sonner";

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