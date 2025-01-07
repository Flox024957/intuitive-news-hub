import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type Video } from "@/types/video";

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

        // Sauvegarder chaque vidéo dans la base de données
        const savedVideos = await Promise.all(
          youtubeData.videos.map(async (video: any) => {
            try {
              // Vérifier si la vidéo existe déjà
              const { data: existingVideo } = await supabase
                .from('videos')
                .select('*')
                .eq('youtube_video_id', video.id)
                .maybeSingle();

              if (existingVideo) {
                console.log('Video already exists:', video.id);
                return existingVideo;
              }

              // Insérer la nouvelle vidéo
              const { data: newVideo, error: insertError } = await supabase
                .from('videos')
                .insert({
                  youtube_video_id: video.id,
                  title: video.title,
                  summary: video.description,
                  published_date: video.publishedAt,
                  thumbnail_url: video.thumbnail,
                  video_url: `https://www.youtube.com/watch?v=${video.id}`,
                })
                .select()
                .single();

              if (insertError) {
                console.error('Error saving video:', insertError);
                return null;
              }

              console.log('Video saved successfully:', newVideo.id);
              return newVideo;
            } catch (error) {
              console.error(`Error processing video ${video.id}:`, error);
              return null;
            }
          })
        );

        // Filtrer les vidéos null (erreurs) et retourner les vidéos sauvegardées
        return savedVideos.filter((video): video is Video => video !== null);
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