import { supabase } from "@/integrations/supabase/client";

export async function getYouTubeAudioUrl(videoId: string): Promise<string> {
  try {
    console.log('Calling get-youtube-audio function with videoId:', videoId);
    
    const { data, error } = await supabase.functions.invoke('get-youtube-audio', {
      body: { videoId },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response from get-youtube-audio:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    if (!data?.audioUrl) {
      console.error('No audio URL returned:', data);
      throw new Error('No audio URL returned from function');
    }

    return data.audioUrl;
  } catch (error) {
    console.error('Error getting YouTube audio:', error);
    throw new Error('Failed to get YouTube audio URL');
  }
}