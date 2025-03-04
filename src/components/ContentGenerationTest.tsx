import { useState, useEffect } from "react";
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
  const [error, setError] = useState<string | null>(null);

  const testHuggingFaceAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null); // Reset result before new test
      
      console.log("Starting HuggingFace API test...");
      
      const { data, error: apiError } = await supabase.functions.invoke('enhanced-content-generation', {
        body: {
          videoId: 'test',
          transcript: 'Ceci est un test simple de l\'API HuggingFace. Nous voulons vérifier si l\'API fonctionne correctement et peut générer du contenu cohérent.',
          title: 'Test API HuggingFace'
        }
      });

      if (apiError) {
        console.error('Error response from Edge Function:', apiError);
        throw new Error(`Erreur Edge Function: ${apiError.message}`);
      }

      if (!data) {
        throw new Error('Aucune donnée reçue de l\'API');
      }

      console.log('API test response:', data);
      
      setResult(data);
      toast.success("Test de l'API HuggingFace réussi !");
      
    } catch (error: any) {
      console.error('Test failed:', error);
      setError(error.message);
      toast.error(`Échec du test: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Exécuter le test une seule fois au montage du composant
  useEffect(() => {
    testHuggingFaceAPI();
  }, []); // Tableau de dépendances vide pour n'exécuter qu'au montage

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test de l'API HuggingFace</h2>
        <Button 
          onClick={testHuggingFaceAPI} 
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            "Tester l'API HuggingFace"
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      )}

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