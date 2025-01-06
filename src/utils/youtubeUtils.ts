import { supabase } from "@/integrations/supabase/client";

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const searchParams = new URLSearchParams(urlObj.search);
    return searchParams.get('v');
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

export async function getYouTubeAudioUrl(videoUrl: string): Promise<string> {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

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