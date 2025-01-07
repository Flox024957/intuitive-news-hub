import { type YouTubeVideo } from "@/types/video";
import { supabase } from "@/integrations/supabase/client";

export async function fetchYouTubeData(username: string): Promise<YouTubeVideo[]> {
  console.log('Fetching YouTube data for:', username);
  
  const { data: youtubeData, error: youtubeError } = await supabase.functions.invoke(
    'youtube-data',
    {
      body: { username }
    }
  );

  if (youtubeError) {
    console.error('Error fetching YouTube data:', youtubeError);
    throw new Error("Erreur lors de la récupération des vidéos YouTube");
  }

  if (!youtubeData?.videos) {
    console.log('No videos found for channel:', username);
    return [];
  }

  return youtubeData.videos;
}