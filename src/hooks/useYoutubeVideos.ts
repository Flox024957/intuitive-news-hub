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
          summary: video.description,
          thumbnail_url: video.thumbnail,
          published_date: video.publishedAt,
          categories: ["News", "Politics", "Science", "Technology", "Economy", "Culture"],
          stats: {
            view_count: video.statistics.viewCount || 0
          }
        }));
      } catch (error) {
        console.error('Error:', error);
        toast.error("Erreur lors de la récupération des vidéos");
        return [];
      }
    }
  });
};