import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  summary: string;
  article: string;
}

export function ContentGenerationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleTest = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer une vidéo de test avec une transcription
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .not('full_transcript', 'is', null)
        .limit(1)
        .single();

      if (videoError || !video) {
        toast.error("Aucune vidéo avec transcription trouvée");
        return;
      }

      // Générer le contenu en utilisant le nom correct de la fonction
      const { data, error } = await supabase.functions.invoke('enhanced-content-generation', {
        body: {
          videoId: video.id,
          transcript: video.full_transcript,
          title: video.title
        }
      });

      if (error) {
        throw error;
      }

      setResult(data);
      toast.success("Contenu généré avec succès !");
      
    } catch (error) {
      console.error('Error testing content generation:', error);
      toast.error("Erreur lors de la génération du contenu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test de Génération de Contenu</h2>
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            "Tester la génération"
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Résumé généré :</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <p className="whitespace-pre-wrap">{result.summary}</p>
            </ScrollArea>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Article généré :</h3>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap prose prose-invert max-w-none">
                {result.article}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </Card>
  );
}