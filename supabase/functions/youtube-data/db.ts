import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { VideoData } from "./types.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCachedVideos(): Promise<VideoData[]> {
  try {
    console.log('Fetching cached videos from database...');
    
    const { data: videos, error } = await supabase
      .from('videos')
      .select(`
        id,
        youtube_video_id,
        title,
        summary,
        published_date,
        thumbnail_url,
        stats:video_stats(*)
      `)
      .order('published_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching cached videos:', error);
      return [];
    }

    console.log(`Found ${videos?.length || 0} cached videos`);
    
    return videos.map(video => ({
      id: video.youtube_video_id,
      title: video.title,
      description: video.summary || '',
      thumbnail: video.thumbnail_url || '',
      publishedAt: video.published_date,
      statistics: video.stats?.[0] ? {
        viewCount: video.stats[0].view_count?.toString(),
        likeCount: video.stats[0].like_count?.toString()
      } : undefined
    }));
  } catch (error) {
    console.error('Unexpected error in getCachedVideos:', error);
    return [];
  }
}

export async function saveVideosToCache(videos: VideoData[]): Promise<void> {
  try {
    console.log(`Attempting to cache ${videos.length} videos`);
    
    for (const video of videos) {
      const { error } = await supabase
        .from('videos')
        .upsert({
          youtube_video_id: video.id,
          title: video.title,
          summary: video.description,
          published_date: video.publishedAt,
          thumbnail_url: video.thumbnail,
          video_url: `https://www.youtube.com/watch?v=${video.id}`,
          categories: ['news']
        })
        .single();

      if (error) {
        console.error('Error caching video:', video.id, error);
      } else {
        console.log('Successfully cached video:', video.id);
      }
    }
  } catch (error) {
    console.error('Unexpected error in saveVideosToCache:', error);
  }
}