import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useYoutubeVideos = (username: string) => {
  return useQuery({
    queryKey: ['youtube-videos', username],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('youtube-data', {
          body: { username }
        });

        if (error) {
          console.error('Error fetching YouTube data:', error);
          toast.error("Erreur lors de la récupération des vidéos YouTube");
          return [];
        }

        return data.videos.map((video: any) => ({
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          publishedAt: video.publishedAt,
          statistics: video.statistics || { viewCount: '0' },
          categories: [] // Sera défini par le trigger de la base de données
        }));
      } catch (error) {
        console.error('Error:', error);
        toast.error("Erreur lors de la récupération des vidéos");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });
};