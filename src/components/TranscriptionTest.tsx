import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { pipeline } from "@huggingface/transformers";
import { getYouTubeAudioUrl } from "@/utils/youtubeUtils";
import { supabase } from "@/integrations/supabase/client";

export function TranscriptionTest() {
  const [videoId, setVideoId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranscribe = async () => {
    if (!videoId) {
      toast.error("Veuillez fournir un ID de vidéo YouTube");
      return;
    }

    try {
      setLoading(true);
      
      // Obtenir l'URL de l'audio
      const audioUrl = await getYouTubeAudioUrl(videoId);
      
      // Initialiser le pipeline de transcription
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "openai/whisper-tiny",
        { 
          device: "cpu", // Utiliser CPU par défaut, WebGPU si disponible
          chunk_length_s: 30, // Découper en segments de 30 secondes
          stride_length_s: 5, // Chevauchement de 5 secondes entre les segments
        }
      );
      
      // Transcrire l'audio
      const result = await transcriber(audioUrl);
      
      // Sauvegarder la transcription dans Supabase
      const { error: updateError } = await supabase
        .from('videos')
        .update({ 
          full_transcript: result.text,
        })
        .eq('youtube_video_id', videoId);

      if (updateError) {
        throw updateError;
      }
      
      console.log('Transcription:', result);
      toast.success('Transcription générée et sauvegardée avec succès !');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || "Erreur lors de la transcription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="ID de la vidéo YouTube"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        />
        <Button 
          onClick={handleTranscribe}
          disabled={!videoId || loading}
        >
          {loading ? "Transcription..." : "Transcrire"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Note: Entrez l'ID de la vidéo YouTube (ex: dQw4w9WgXcQ pour https://www.youtube.com/watch?v=dQw4w9WgXcQ)
      </p>
    </div>
  );
}