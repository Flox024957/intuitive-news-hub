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
    const { title, description, summary } = await req.json();

    if (!summary && !description) {
      throw new Error('Either summary or description is required');
    }

    console.log('Analyzing content:', { title, description, summary });

    // Définition des catégories et leurs mots-clés associés avec plus de précision
    const categories = {
      'News': [
        'actualité', 'information', 'dernière', 'récent', 'nouveau', 'breaking',
        'reportage', 'journal', 'média', 'presse', 'événement'
      ],
      'Politique': [
        'politique', 'gouvernement', 'élection', 'président', 'ministre', 'loi',
        'réforme', 'assemblée', 'parlement', 'député', 'sénat', 'démocratie',
        'état', 'constitution', 'vote'
      ],
      'Économie': [
        'économie', 'finance', 'marché', 'entreprise', 'croissance', 'inflation',
        'investissement', 'bourse', 'commerce', 'business', 'startup', 'innovation',
        'entrepreneur', 'management', 'stratégie'
      ],
      'Science': [
        'science', 'recherche', 'découverte', 'étude', 'expérience', 'théorie',
        'scientifique', 'laboratoire', 'cerveau', 'biologie', 'physique', 'chimie',
        'neuroscience', 'cognition', 'intelligence'
      ],
      'Technologie': [
        'technologie', 'innovation', 'numérique', 'intelligence artificielle',
        'digital', 'tech', 'ia', 'algorithme', 'données', 'informatique',
        'cybersécurité', 'blockchain', 'robot', 'internet'
      ],
      'Culture': [
        'culture', 'art', 'musique', 'cinéma', 'littérature', 'société',
        'philosophie', 'histoire', 'civilisation', 'tradition', 'patrimoine',
        'identité', 'religion', 'spiritualité'
      ],
      'Development': [
        'développement personnel', 'croissance personnelle', 'motivation',
        'productivité', 'apprentissage', 'formation', 'éducation', 'coaching',
        'mentorat', 'leadership', 'succès', 'objectif', 'potentiel'
      ]
    };

    // Analyse du texte pour chaque catégorie
    const scores: CategoryScore[] = [];
    const contentToAnalyze = [
      title?.toLowerCase() || '',
      description?.toLowerCase() || '',
      summary?.toLowerCase() || ''
    ].join(' ');

    for (const [category, keywords] of Object.entries(categories)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = contentToAnalyze.match(regex);
        if (matches) {
          // Donner plus de poids aux mots trouvés dans le titre
          const titleMatches = title?.toLowerCase().match(regex)?.length || 0;
          score += matches.length + (titleMatches * 2);
        }
      }
      
      // Normaliser le score en fonction du nombre de mots-clés et de la longueur du contenu
      const normalizedScore = score / (keywords.length * Math.log(contentToAnalyze.length));
      if (normalizedScore > 0.1) { // Seuil minimum de pertinence
        scores.push({ category, score: normalizedScore });
      }
    }

    // Trier les scores et prendre jusqu'à 3 catégories les plus pertinentes
    const topCategories = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.category);

    console.log('Analysis results:', {
      topCategories,
      scores: scores.sort((a, b) => b.score - a.score)
    });

    // S'assurer qu'il y a au moins une catégorie
    if (topCategories.length === 0) {
      topCategories.push('News');
    }

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