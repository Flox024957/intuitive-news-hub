import { createClient } from '@supabase/supabase-js';
import { VideoData } from './types';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCachedVideos(channelId: string): Promise<VideoData[]> {
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