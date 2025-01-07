import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function analyzeContent(title: string, description: string, videoId: string) {
  try {
    // Appeler la fonction d'analyse de contenu
    const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
      'analyze-content',
      {
        body: { title, summary: description }
      }
    );

    if (analysisError) {
      console.error('Error analyzing content:', analysisError);
      return ['news'];
    }

    // Vérifier si la vidéo a moins de 48h
    const publishDate = new Date();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    let categories = analysisResult.categories;
    
    // Ajouter automatiquement le tag "news" pour les vidéos récentes
    if (publishDate >= fortyEightHoursAgo && !categories.includes('news')) {
      categories = ['news', ...categories].slice(0, 3);
    }

    console.log('Content analysis complete:', {
      videoId,
      categories,
      scores: analysisResult.scores
    });

    return categories;
  } catch (error) {
    console.error('Error in analyzeContent:', error);
    return ['news'];
  }
}