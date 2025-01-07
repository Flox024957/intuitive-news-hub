import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Video } from "@/types/video";

export const useYouTubeVideos = (channelId: string) => {
  return useQuery({
    queryKey: ['youtube-videos', channelId],
    queryFn: async () => {
      try {
        console.log('Fetching YouTube data for channel:', channelId);
        
        const { data, error } = await supabase.functions.invoke('youtube-data', {
          body: { username: channelId }
        });

        if (error) {
          console.error('Error fetching YouTube data:', error);
          toast.error("Erreur lors de la récupération des vidéos YouTube");
          return [];
        }

        console.log('YouTube data received:', data);
        
        // Save each video to the database
        const savedVideos = await Promise.all(
          data.videos.map(async (video: any) => {
            try {
              const { data: existingVideo } = await supabase
                .from('videos')
                .select('*')
                .eq('youtube_video_id', video.id)
                .single();

              if (existingVideo) {
                console.log('Video already exists:', existingVideo);
                return existingVideo;
              }

              const { data: savedVideo, error: saveError } = await supabase
                .from('videos')
                .insert({
                  youtube_video_id: video.id,
                  title: video.title,
                  summary: video.description,
                  published_date: video.publishedAt,
                  thumbnail_url: video.thumbnail,
                  video_url: `https://www.youtube.com/watch?v=${video.id}`,
                  categories: ['news']
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

        return savedVideos.filter(Boolean) as Video[];
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