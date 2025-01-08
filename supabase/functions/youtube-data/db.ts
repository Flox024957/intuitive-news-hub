import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { VideoData } from "./types.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCachedVideos(): Promise<VideoData[]> {
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

  return videos.map(video => ({
    id: video.youtube_video_id,
    title: video.title,
    description: video.summary || '',
    thumbnail: video.thumbnail_url || '',
    publishedAt: video.published_date,
    statistics: video.stats?.[0] ? {
      viewCount: video.stats[0].view_count.toString(),
      likeCount: video.stats[0].like_count?.toString()
    } : undefined
  }));
}

export async function saveVideosToCache(videos: VideoData[]): Promise<void> {
  for (const video of videos) {
    const { error } = await supabase
      .from('videos')
      .upsert({
        youtube_video_id: video.id,
        title: video.title,
        summary: video.description,
        published_date: video.publishedAt,
        thumbnail_url: video.thumbnail,
        video_url: `https://www.youtube.com/watch?v=${video.id}`
      })
      .single();

    if (error) {
      console.error('Error caching video:', error);
    }
  }
}