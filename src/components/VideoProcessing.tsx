import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateSummary } from "@/utils/summaryUtils";

interface VideoProcessingProps {
  videoId: string;
  transcript: string | null;
  onSummaryGenerated: (summary: string) => void;
}

export function VideoProcessing({ videoId, transcript, onSummaryGenerated }: VideoProcessingProps) {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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