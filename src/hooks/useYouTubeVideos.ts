import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type YouTubeVideo } from "@/types/video";

export function useYouTubeVideos(username: string) {
  return useQuery({
    queryKey: ['youtube-videos', username],
    queryFn: async () => {
      try {
        console.log('Fetching YouTube data for:', username);
        
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

        const videos = youtubeData.videos;
        console.log('YouTube videos fetched:', videos.length);

        // Process each video
        for (const video of videos) {
          try {
            // Check if video exists
            const { data: existingVideo } = await supabase
              .from('videos')
              .select('id')
              .eq('youtube_video_id', video.id)
              .maybeSingle();

            if (!existingVideo) {
              console.log('Processing new video:', video.id);
              
              // Analyze content for categories
              const { data: analysisData } = await supabase.functions.invoke(
                'analyze-video-tags',
                {
                  body: {
                    title: video.title,
                    description: video.description,
                    summary: null
                  }
                }
              );

              const categories = analysisData?.categories || ['news'];
              console.log('Categories detected:', categories);

              // Insert new video
              const { error: insertError } = await supabase
                .from('videos')
                .insert({
                  youtube_video_id: video.id,
                  title: video.title,
                  summary: video.description,
                  published_date: video.publishedAt,
                  thumbnail_url: video.thumbnail,
                  video_url: `https://www.youtube.com/watch?v=${video.id}`,
                  categories: categories.slice(0, 3)
                });

              if (insertError) {
                console.error('Error saving video:', insertError);
                continue;
              }

              // Get the inserted video to get its ID
              const { data: newVideo } = await supabase
                .from('videos')
                .select('id')
                .eq('youtube_video_id', video.id)
                .single();

              if (newVideo) {
                // Initialize video stats
                await supabase
                  .from('video_stats')
                  .insert({
                    video_id: newVideo.id,
                    view_count: parseInt(video.statistics?.viewCount || '0', 10),
                    like_count: parseInt(video.statistics?.likeCount || '0', 10),
                    share_count: 0
                  });
              }

              console.log('Video saved successfully:', newVideo?.id);
            }
          } catch (error) {
            console.error('Error processing video:', error);
            continue;
          }
        }

        return videos as YouTubeVideo[];
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