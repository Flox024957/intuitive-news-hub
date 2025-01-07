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

const categories = {
  'politics': [
    'politique', 'gouvernement', 'élection', 'président', 'ministre',
    'assemblée', 'parlement', 'démocratie', 'loi', 'réforme'
  ],
  'economy': [
    'économie', 'finance', 'marché', 'entreprise', 'croissance',
    'inflation', 'investissement', 'bourse', 'commerce', 'business'
  ],
  'science': [
    'science', 'recherche', 'découverte', 'étude', 'laboratoire',
    'expérience', 'scientifique', 'biologie', 'physique', 'chimie'
  ],
  'technology': [
    'technologie', 'innovation', 'numérique', 'intelligence artificielle',
    'digital', 'tech', 'ia', 'algorithme', 'données', 'informatique'
  ],
  'culture': [
    'culture', 'art', 'musique', 'cinéma', 'littérature',
    'théâtre', 'exposition', 'spectacle', 'festival', 'patrimoine'
  ],
  'entertainment': [
    'divertissement', 'spectacle', 'film', 'série', 'show',
    'jeu', 'loisir', 'amusement', 'détente', 'récréation'
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, summary } = await req.json();
    console.log('Analyzing content:', { title, summary });

    if (!summary) {
      throw new Error('Summary is required for analysis');
    }

    const content = `${title} ${summary}`.toLowerCase();
    const scores: CategoryScore[] = [];

    // Analyse du contenu pour chaque catégorie
    for (const [category, keywords] of Object.entries(categories)) {
      let score = 0;
      let matches = 0;
      
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const keywordMatches = (content.match(regex) || []).length;
        
        if (keywordMatches > 0) {
          matches++;
          // Donner plus de poids aux mots trouvés dans le titre
          const titleMatches = (title.toLowerCase().match(regex) || []).length;
          score += keywordMatches + (titleMatches * 2);
        }
      }
      
      // Calculer un score normalisé
      if (matches > 0) {
        const normalizedScore = (score / keywords.length) * (matches / keywords.length);
        scores.push({ category, score: normalizedScore });
      }
    }

    // Trier les scores et prendre les 3 catégories les plus pertinentes
    const topCategories = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(cat => cat.score > 0.1) // Seuil minimum de pertinence
      .map(item => item.category);

    console.log('Analysis results:', {
      topCategories,
      detailedScores: scores.sort((a, b) => b.score - a.score)
    });

    // S'assurer qu'il y a au moins une catégorie
    if (topCategories.length === 0) {
      topCategories.push('news');
    }

    return new Response(
      JSON.stringify({ 
        categories: topCategories,
        scores: scores.sort((a, b) => b.score - a.score)
      }),
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