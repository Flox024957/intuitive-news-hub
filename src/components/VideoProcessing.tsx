import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateSummary } from "@/utils/summaryUtils";
import { transcribeAudio, updateVideoTranscript } from "@/utils/transcriptionUtils";

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

  const handleTranscribe = async () => {
    if (!audioUrl) {
      toast.error("URL audio non disponible");
      return;
    }

    try {
      setIsTranscribing(true);
      const transcription = await transcribeAudio(audioUrl);
      
      if (transcription) {
        const success = await updateVideoTranscript(videoId, transcription);
        if (success && onTranscriptionComplete) {
          onTranscriptionComplete(transcription);
        }
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript) {
      toast.error("La transcription n'est pas disponible");
      return;
    }

    try {
      setIsGeneratingSummary(true);
      const summary = await generateSummary(transcript);
      onSummaryGenerated(summary);
      toast.success("Résumé généré avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération du résumé:", error);
      toast.error("Erreur lors de la génération du résumé");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-4">
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