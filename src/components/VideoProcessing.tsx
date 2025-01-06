import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { generateSummary } from "@/utils/summaryUtils";
import { transcribeAudio, updateVideoTranscript } from "@/utils/transcriptionUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoProcessingProps {
  videoId: string;
  audioUrl?: string;
  transcript: string | null;
  onTranscriptionComplete?: (transcript: string) => void;
  onSummaryGenerated: (summary: string) => void;
}

export function VideoProcessing({ 
  videoId, 
  audioUrl, 
  transcript, 
  onTranscriptionComplete,
  onSummaryGenerated 
}: VideoProcessingProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscribe = async () => {
    if (!audioUrl) {
      toast.error("URL audio non disponible");
      setError("L'URL audio n'est pas disponible pour la transcription");
      return;
    }

    try {
      setError(null);
      setIsTranscribing(true);
      console.log("Début de la transcription pour la vidéo:", videoId);
      
      const transcription = await transcribeAudio(audioUrl);
      
      if (transcription) {
        console.log("Transcription réussie, mise à jour de la base de données");
        const success = await updateVideoTranscript(videoId, transcription);
        if (success && onTranscriptionComplete) {
          console.log("Mise à jour de l'interface avec la nouvelle transcription");
          onTranscriptionComplete(transcription);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la transcription:", err);
      setError("Une erreur est survenue lors de la transcription");
      toast.error("Erreur lors de la transcription");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript) {
      toast.error("La transcription n'est pas disponible");
      setError("La transcription est nécessaire pour générer un résumé");
      return;
    }

    try {
      setError(null);
      setIsGeneratingSummary(true);
      console.log("Début de la génération du résumé pour la vidéo:", videoId);
      
      const summary = await generateSummary(transcript);
      console.log("Résumé généré avec succès");
      onSummaryGenerated(summary);
      toast.success("Résumé généré avec succès");
    } catch (err) {
      console.error("Erreur lors de la génération du résumé:", err);
      setError("Une erreur est survenue lors de la génération du résumé");
      toast.error("Erreur lors de la génération du résumé");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!transcript && audioUrl && (
        <Button
          onClick={handleTranscribe}
          disabled={isTranscribing}
          className="w-full"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transcription en cours...
            </>
          ) : (
            "Transcrire la vidéo"
          )}
        </Button>
      )}
      
      {transcript && (
        <Button
          onClick={handleGenerateSummary}
          disabled={isGeneratingSummary}
          className="w-full"
        >
          {isGeneratingSummary ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération du résumé en cours...
            </>
          ) : (
            "Générer un résumé"
          )}
        </Button>
      )}
    </div>
  );
}