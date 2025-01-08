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

  const testHuggingFaceAPI = async () => {
    try {
      setIsLoading(true);
      
      // Test simple avec un prompt basique
      const { data, error } = await supabase.functions.invoke('enhanced-content-generation', {
        body: {
          videoId: 'test',
          transcript: 'Ceci est un test de l\'API HuggingFace.',
          title: 'Test API'
        }
      });

      if (error) {
        console.error('Error testing HuggingFace API:', error);
        throw error;
      }

      setResult(data);
      toast.success("Test de l'API HuggingFace réussi !");
      
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(`Erreur lors du test de l'API: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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