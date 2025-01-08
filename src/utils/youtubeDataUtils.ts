import { type YouTubeVideo } from "@/types/video";
import { supabase } from "@/integrations/supabase/client";

export async function fetchYouTubeData(username: string): Promise<YouTubeVideo[]> {
  console.log('Fetching YouTube data for:', username);
  
  try {
    const { data: youtubeData, error: youtubeError } = await supabase.functions.invoke(
      'youtube-data',
      {
        body: { username }
      }
    );

    if (youtubeError) {
      // Check if the error is due to quota
      if (youtubeError.message?.includes('quotaExceeded') || youtubeError.status === 429) {
        console.warn('YouTube API quota exceeded');
        throw new Error('quotaExceeded');
      }
      console.error('Error fetching YouTube data:', youtubeError);
      throw new Error("Erreur lors de la récupération des vidéos YouTube");
    }

    if (!youtubeData?.videos) {
      console.log('No videos found for channel:', username);
      return [];
    }

    return youtubeData.videos;
  } catch (error: any) {
    // Propagate quota error
    if (error.message === 'quotaExceeded' || error.status === 429) {
      throw error;
    }
    console.error('Error in fetchYouTubeData:', error);
    throw new Error(`Failed to fetch YouTube data: ${error.message}`);
  }
}