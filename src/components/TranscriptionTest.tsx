import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TranscriptionTest() {
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranscribe = async () => {
    if (!audioUrl) {
      toast.error("Veuillez fournir une URL audio");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('transcribe-video', {
        body: { audioUrl }
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
          placeholder="URL du fichier audio (format WAV)"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
        />
        <Button 
          onClick={handleTranscribe}
          disabled={!audioUrl || loading}
        >
          {loading ? "Transcription..." : "Transcrire"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Note: Le fichier audio doit être au format WAV et accessible publiquement.
      </p>
    </div>
  );
}