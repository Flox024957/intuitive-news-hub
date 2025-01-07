import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useYouTubeVideos = (username: string) => {
  return useQuery({
    queryKey: ['youtube-videos', username],
    queryFn: async () => {
      try {
        console.log('Fetching YouTube data for username:', username);
        
        const { data, error } = await supabase.functions.invoke('youtube-data', {
          body: { username }
        });

        if (error) {
          console.error('Error fetching YouTube data:', error);
          toast.error("Erreur lors de la récupération des vidéos YouTube");
          return [];
        }

        console.log('YouTube data received:', data);
        
        // Sauvegarder chaque vidéo dans la base de données
        const savedVideos = await Promise.all(
          data.videos.map(async (video: any) => {
            try {
              const { data: savedVideo, error: saveError } = await supabase
                .from('videos')
                .insert({
                  youtube_video_id: video.id,
                  title: video.title,
                  summary: video.description,
                  published_date: video.publishedAt,
                  thumbnail_url: video.thumbnail,
                  video_url: `https://www.youtube.com/watch?v=${video.id}`,
                  categories: ['news'] // Sera mis à jour par le trigger analyze_video_categories
                })
                .select()
                .single();

              if (saveError) {
                console.error('Error saving video:', saveError);
                throw saveError;
              }

              console.log('Video saved successfully:', savedVideo);
              return savedVideo;
            } catch (error) {
              console.error(`Error processing video ${video.id}:`, error);
              return null;
            }
          })
        );

        return savedVideos.filter(Boolean);
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