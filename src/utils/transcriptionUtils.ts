import { supabase } from "@/integrations/supabase/client";

export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    console.log('Starting transcription for audio URL:', audioUrl);
    
    const { data, error } = await supabase.functions.invoke('transcribe-audio', {
      body: { audioUrl }
    });

    if (error) {
      console.error('Transcription function error:', error);
      throw error;
    }

    if (!data?.text) {
      throw new Error('No transcription text returned');
    }

    console.log('Transcription completed successfully');
    return data.text;
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw new Error('Failed to transcribe audio');
  }
}