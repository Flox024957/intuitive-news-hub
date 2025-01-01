import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { pipeline } from "@huggingface/transformers";

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
      
      // Initialiser le pipeline de transcription
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "openai/whisper-tiny",
        { device: "cpu" } // Utiliser CPU par défaut, WebGPU si disponible
      );

      // Obtenir l'URL audio de la vidéo YouTube
      const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Transcrire l'audio
      const result = await transcriber(audioUrl);
      
      console.log('Transcription:', result);
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