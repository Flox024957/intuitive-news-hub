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

        // Sauvegarder chaque vidéo dans la base de données
        const savedVideos = await Promise.all(
          videos.map(async (video) => {
            try {
              const savedVideoId = await saveVideoToDatabase(video);
              console.log('Video saved successfully:', savedVideoId);
              return video;
            } catch (error) {
              console.error('Error saving video:', video.id, error);
              return video; // On retourne quand même la vidéo pour l'affichage
            }
          })
        );

        return savedVideos;
      } catch (error) {
        console.error('Error in useYouTubeVideos:', error);
        toast.error("Erreur lors du traitement des vidéos");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
}