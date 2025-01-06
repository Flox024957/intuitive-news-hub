import { supabase } from "@/integrations/supabase/client";

export async function generateSummary(text: string): Promise<string> {
  try {
    console.log('Démarrage de la génération du résumé pour un texte de', text.length, 'caractères');
    
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

    console.log('Résumé généré avec succès:', {
      inputLength: text.length,
      summaryLength: data.summary.length
    });
    
    return data.summary;
  } catch (error) {
    console.error('Erreur dans generateSummary:', error);
    throw error;
  }
}