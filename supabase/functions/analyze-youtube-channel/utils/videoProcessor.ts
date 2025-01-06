import { createClient } from '@supabase/supabase-js';

export async function processYouTubeVideos(channelId: string, excludeShorts: boolean = true) {
  const youtube = google.youtube('v3');
  
  try {
    // Get channel's uploads playlist ID
    const channelResponse = await youtube.channels.list({
      part: ['contentDetails'],
      id: [channelId],
    });

    const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) throw new Error('Could not find uploads playlist');

    // Get videos from playlist
    const playlistResponse = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
    });

    const videoIds = playlistResponse.data.items?.map(item => item.contentDetails?.videoId).filter(Boolean) || [];

    // Get detailed video information
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
    });

    // Filter out Shorts based on video duration and aspect ratio
    const processedVideos = videosResponse.data.items?.filter(video => {
      if (!video.contentDetails?.duration) return false;
      
      // Convert duration to seconds
      const duration = parseDuration(video.contentDetails.duration);
      const isShort = duration < 60 && video.snippet?.description?.toLowerCase().includes('#shorts');
      
      return !excludeShorts || !isShort;
    }).map(video => ({
      id: video.id,
      title: video.snippet?.title,
      description: video.snippet?.description,
      thumbnail: video.snippet?.thumbnails?.maxres?.url || video.snippet?.thumbnails?.high?.url,
      publishedAt: video.snippet?.publishedAt,
      statistics: video.statistics,
    }));

    return processedVideos || [];
  } catch (error) {
    console.error('Error processing YouTube videos:', error);
    throw error;
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (parseInt(match?.[1] || '0')) || 0;
  const minutes = (parseInt(match?.[2] || '0')) || 0;
  const seconds = (parseInt(match?.[3] || '0')) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}