import { VideoData } from "./types.ts";

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!;

export async function fetchYouTubeVideos(channelId: string): Promise<VideoData[]> {
  try {
    console.log('Fetching YouTube data for channel:', channelId);
    
    // Get channel details
    const channelResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!channelResponse.ok) {
      const error = await channelResponse.json();
      console.error('Channel fetch error:', error);
      
      if (error.error?.errors?.some((e: any) => e.reason === 'quotaExceeded')) {
        throw new Error('quotaExceeded');
      }
      throw new Error(`Channel fetch failed: ${JSON.stringify(error)}`);
    }

    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      console.error('No uploads playlist found for channel:', channelId);
      throw new Error('No uploads playlist found');
    }

    console.log('Found uploads playlist:', uploadsPlaylistId);

    // Get videos from playlist
    const videosResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      const error = await videosResponse.json();
      console.error('Videos fetch error:', error);
      
      if (error.error?.errors?.some((e: any) => e.reason === 'quotaExceeded')) {
        throw new Error('quotaExceeded');
      }
      throw new Error(`Videos fetch failed: ${JSON.stringify(error)}`);
    }

    const videosData = await videosResponse.json();
    console.log(`Fetched ${videosData.items?.length || 0} videos from YouTube`);
    
    const videos = videosData.items?.map((item: any) => ({
      id: item.snippet?.resourceId?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.maxres?.url || 
                item.snippet?.thumbnails?.standard?.url || 
                item.snippet?.thumbnails?.high?.url || '',
      publishedAt: item.snippet?.publishedAt || '',
      statistics: item.statistics
    })).filter((video: VideoData) => video.id && video.title) || [];

    console.log(`Processed ${videos.length} valid videos`);
    return videos;

  } catch (error) {
    console.error('Error in fetchYouTubeVideos:', error);
    if (error.message === 'quotaExceeded') {
      throw error;
    }
    throw new Error(`Failed to fetch YouTube data: ${error.message}`);
  }
}