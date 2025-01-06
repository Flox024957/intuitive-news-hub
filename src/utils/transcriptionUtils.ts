import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCachedContent, setCachedContent } from "./cacheUtils";

export async function transcribeAudio(audioUrl: string, videoId: string): Promise<string | null> {
  try {
    console.log('Checking cache for video transcript:', videoId);
    
    const cachedTranscript = await getCachedContent(videoId, 'transcript');
    if (cachedTranscript) {
      console.log('Transcript found in cache');
      toast.success("Transcription récupérée du cache");
      return cachedTranscript;
    }

    console.log('Starting transcription for audio URL:', audioUrl);
    
    const { data, error } = await supabase.functions.invoke('transcribe-with-whisper', {
      body: { audioUrl }
    });

    console.log('Transcription response:', { data, error });

    if (error) {
      console.error('Transcription error:', error);
      toast.error("Erreur lors de la transcription");
      return null;
    }

    if (!data?.text) {
      console.error('No transcription text returned');
      toast.error("Aucun texte transcrit reçu");
      return null;
    }

    // Store in cache
    await setCachedContent(videoId, 'transcript', data.text);

    toast.success("Transcription terminée avec succès");
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    toast.error("Erreur inattendue lors de la transcription");
    return null;
  }
}

export async function updateVideoTranscript(videoId: string, transcript: string) {
  try {
    console.log('Updating transcript for video:', videoId);
    
    const { error } = await supabase
      .from('videos')
      .update({ full_transcript: transcript })
      .eq('id', videoId);

    if (error) {
      console.error('Error updating transcript:', error);
      toast.error("Erreur lors de la sauvegarde de la transcription");
      return false;
    }

    // Update cache
    await setCachedContent(videoId, 'transcript', transcript);

    toast.success("Transcription sauvegardée");
    return true;
  } catch (error) {
    console.error('Error updating transcript:', error);
    toast.error("Erreur lors de la mise à jour de la transcription");
    return false;
  }
}