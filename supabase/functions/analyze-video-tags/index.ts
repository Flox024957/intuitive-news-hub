import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CategoryScore {
  category: string;
  score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { summary } = await req.json();

    if (!summary) {
      throw new Error('Summary is required');
    }

    console.log('Analyzing video summary:', summary);

    // Définition des catégories et leurs mots-clés associés
    const categories = {
      'News': ['actualité', 'information', 'dernière', 'récent', 'nouveau', 'breaking'],
      'Politique': ['politique', 'gouvernement', 'élection', 'président', 'ministre', 'loi', 'réforme'],
      'Économie': ['économie', 'finance', 'marché', 'entreprise', 'croissance', 'inflation', 'investissement'],
      'Science': ['science', 'recherche', 'découverte', 'étude', 'expérience', 'théorie'],
      'Technologie': ['technologie', 'innovation', 'numérique', 'intelligence artificielle', 'digital', 'tech'],
      'Culture': ['culture', 'art', 'musique', 'cinéma', 'littérature', 'société'],
      'Développement': ['développement personnel', 'croissance personnelle', 'motivation', 'productivité']
    };

    // Analyse du texte pour chaque catégorie
    const scores: CategoryScore[] = [];
    const normalizedSummary = summary.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = normalizedSummary.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      
      // Normaliser le score en fonction du nombre de mots-clés
      const normalizedScore = score / keywords.length;
      if (normalizedScore > 0) {
        scores.push({ category, score: normalizedScore });
      }
    }

    // Trier les scores et prendre les 3 catégories les plus pertinentes
    const topCategories = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(item => item.score > 0.1) // Seuil minimum de pertinence
      .map(item => item.category);

    console.log('Analysis results:', {
      topCategories,
      scores
    });

    return new Response(
      JSON.stringify({ categories: topCategories }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});