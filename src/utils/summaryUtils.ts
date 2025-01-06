import { supabase } from "@/integrations/supabase/client";

export async function generateSummary(text: string, videoId: string): Promise<string> {
  try {
    console.log('Checking cache for video summary:', videoId);
    
    // Check cache first
    const { data: cachedSummary } = await supabase
      .from('content_cache')
      .select('content')
      .eq('video_id', videoId)
      .eq('content_type', 'summary')
      .single();

    if (cachedSummary) {
      console.log('Summary found in cache');
      return cachedSummary.content;
    }

    console.log('No cached summary found, generating new summary');
    
    // Vérification de la longueur du texte
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
    const { error: cacheError } = await supabase
      .from('content_cache')
      .insert({
        video_id: videoId,
        content_type: 'summary',
        content: data.summary
      });

    if (cacheError) {
      console.error('Erreur lors de la mise en cache du résumé:', cacheError);
    }

    console.log('Summary generated and cached successfully');
    return data.summary;
  } catch (error) {
    console.error('Erreur dans generateSummary:', error);
    throw error;
  }
}