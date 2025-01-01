import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { data, error } = await supabase.functions.invoke('transcribe-youtube', {
        body: { videoId }
      });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      if (!data?.transcription) {
        throw new Error('Aucune transcription générée');
      }

      console.log('Transcription:', data);
      toast.success('Transcription générée avec succès !');
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