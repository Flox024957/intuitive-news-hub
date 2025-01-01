import { supabase } from "@/integrations/supabase/client";

export async function getYouTubeAudioUrl(videoId: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('get-youtube-audio', {
      body: { videoId }
    });

    if (error) throw error;
    if (!data?.audioUrl) throw new Error('No audio URL returned');

    return data.audioUrl;
  } catch (error) {
    console.error('Error getting YouTube audio:', error);
    throw new Error('Failed to get YouTube audio URL');
  }
}