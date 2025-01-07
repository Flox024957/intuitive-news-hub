import { type YouTubeVideo } from "@/types/video";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function analyzeVideoContent(title: string, description: string) {
  const { data: analysisData } = await supabase.functions.invoke(
    'analyze-video-tags',
    {
      body: {
        title,
        description,
        summary: null
      }
    }
  );

  return analysisData?.categories || ['news'];
}

export async function saveVideoToDatabase(video: YouTubeVideo) {
  try {
    console.log('Checking if video exists:', video.id);
    
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('youtube_video_id', video.id)
      .maybeSingle();

    if (existingVideo) {
      console.log(`Video ${video.id} already exists`);
      return existingVideo.id;
    }

    const categories = await analyzeVideoContent(video.title, video.description);
    
    const { data: newVideo, error: insertError } = await supabase
      .from('videos')
      .insert({
        youtube_video_id: video.id,
        title: video.title,
        summary: video.description,
        published_date: video.publishedAt,
        thumbnail_url: video.thumbnail,
        video_url: `https://www.youtube.com/watch?v=${video.id}`,
        categories: categories.slice(0, 3)
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting video:', insertError);
      throw insertError;
    }

    await initializeVideoStats(newVideo.id, video.statistics);
    
    console.log('Video saved successfully:', newVideo.id);
    return newVideo.id;
  } catch (error) {
    console.error('Error saving video:', error);
    toast.error("Erreur lors de la sauvegarde de la vidéo");
    throw error;
  }
}

async function initializeVideoStats(videoId: string, statistics?: { viewCount?: string; likeCount?: string }) {
  try {
    const { error } = await supabase
      .from('video_stats')
      .insert({
        video_id: videoId,
        view_count: parseInt(statistics?.viewCount || '0', 10),
        like_count: parseInt(statistics?.likeCount || '0', 10),
        share_count: 0
      });

    if (error) {
      console.error('Error initializing video stats:', error);
    }
  } catch (error) {
    console.error('Error initializing video stats:', error);
  }
}