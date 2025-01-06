import { supabase } from "@/integrations/supabase/client";
import { getCachedContent, setCachedContent } from "./cacheUtils";
import { toast } from "sonner";

export async function generateSummary(text: string, videoId: string): Promise<string> {
  try {
    console.log('Checking cache for video summary:', videoId);
    
    const cachedSummary = await getCachedContent(videoId, 'summary');
    if (cachedSummary) {
      console.log('Summary found in cache');
      return cachedSummary;
    }

    console.log('No cached summary found, generating new summary');
    
    if (text.length < 50) {
      throw new Error('Le texte est trop court pour générer un résumé');
    }
    
    const { data, error } = await supabase.functions.invoke('generate-summary', {
      body: { text }
    });

    if (error) {
      console.error('Erreur de la fonction de résumé:', error);
      throw new Error(`Erreur lors de la génération du résumé: ${error.message}`);
    }

    if (!data?.summary) {
      throw new Error('Aucun résumé généré');
    }

    // Store in cache
    await setCachedContent(videoId, 'summary', data.summary);
    
    // Update video record
    const { error: updateError } = await supabase
      .from('videos')
      .update({ summary: data.summary })
      .eq('id', videoId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du résumé dans la table videos:', updateError);
    }

    console.log('Summary generated and cached successfully');
    return data.summary;
  } catch (error) {
    console.error('Erreur dans generateSummary:', error);
    throw error;
  }
}