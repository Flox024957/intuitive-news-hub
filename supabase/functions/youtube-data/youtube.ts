import { VideoData } from "./types.ts";

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!;

export async function fetchYouTubeVideos(channelId: string): Promise<VideoData[]> {
  try {
    // Get channel details
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!channelResponse.ok) {
      const error = await channelResponse.json();
      if (error.error?.errors?.some((e: any) => e.reason === 'quotaExceeded')) {
        throw new Error('quotaExceeded');
      }
      throw new Error(`Channel fetch failed: ${await channelResponse.text()}`);
    }

    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      throw new Error('No uploads playlist found');
    }

    // Get videos from playlist
    const videosResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      const error = await videosResponse.json();
      if (error.error?.errors?.some((e: any) => e.reason === 'quotaExceeded')) {
        throw new Error('quotaExceeded');
      }
      throw new Error(`Videos fetch failed: ${await videosResponse.text()}`);
    }

    const videosData = await videosResponse.json();
    
    return videosData.items?.map((item: any) => ({
      id: item.snippet?.resourceId?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.maxres?.url || 
                item.snippet?.thumbnails?.standard?.url || 
                item.snippet?.thumbnails?.high?.url || '',
      publishedAt: item.snippet?.publishedAt || '',
      statistics: item.statistics
    })).filter((video: VideoData) => video.id && video.title) || [];

  } catch (error) {
    if (error.message === 'quotaExceeded') {
      throw error;
    }
    console.error('Error fetching YouTube data:', error);
    throw new Error('Failed to fetch YouTube data');
  }
}