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
        'reportage', 'journal', 'média', 'presse', 'événement', 'direct',
        'débat', 'interview', 'analyse', 'chronique', 'édito'
      ],
      'Politique': [
        'politique', 'gouvernement', 'élection', 'président', 'ministre', 'loi',
        'réforme', 'assemblée', 'parlement', 'député', 'sénat', 'démocratie',
        'état', 'constitution', 'vote', 'campagne', 'parti', 'opposition',
        'majorité', 'droite', 'gauche', 'centre', 'extrême'
      ],
      'Économie': [
        'économie', 'finance', 'marché', 'entreprise', 'croissance', 'inflation',
        'investissement', 'bourse', 'commerce', 'business', 'startup', 'innovation',
        'entrepreneur', 'management', 'stratégie', 'emploi', 'chômage', 'salaire',
        'budget', 'dette', 'déficit', 'impôt', 'taxe'
      ],
      'Science': [
        'science', 'recherche', 'découverte', 'étude', 'expérience', 'théorie',
        'scientifique', 'laboratoire', 'cerveau', 'biologie', 'physique', 'chimie',
        'neuroscience', 'cognition', 'intelligence', 'médecine', 'santé', 'maladie',
        'traitement', 'vaccin', 'virus', 'bactérie'
      ],
      'Technologie': [
        'technologie', 'innovation', 'numérique', 'intelligence artificielle',
        'digital', 'tech', 'ia', 'algorithme', 'données', 'informatique',
        'cybersécurité', 'blockchain', 'robot', 'internet', 'web', 'mobile',
        'application', 'logiciel', 'programmation', 'code', 'développement'
      ],
      'Culture': [
        'culture', 'art', 'musique', 'cinéma', 'littérature', 'société',
        'philosophie', 'histoire', 'civilisation', 'tradition', 'patrimoine',
        'identité', 'religion', 'spiritualité', 'livre', 'roman', 'poésie',
        'théâtre', 'danse', 'peinture', 'sculpture'
      ],
      'Divertissement': [
        'divertissement', 'spectacle', 'film', 'série', 'show', 'jeu', 'loisir',
        'amusement', 'entertainment', 'fun', 'humour', 'comédie', 'festival',
        'concert', 'exposition', 'événement', 'sortie', 'vacances', 'voyage'
      ],
      'Humour': [
        'humour', 'blague', 'rire', 'comédie', 'sketch', 'stand-up', 'gag',
        'parodie', 'satire', 'comique', 'drôle', 'amusant', 'divertissant',
        'humoriste', 'comédien', 'one-man-show', 'spectacle', 'show'
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
      
      // Normaliser le score en fonction du nombre de mots-clés
      const normalizedScore = score / keywords.length;
      if (normalizedScore > 0.1) { // Seuil minimum de pertinence
        scores.push({ category, score: normalizedScore });
      }
    }

    // Trier les scores et prendre jusqu'à 3 catégories les plus pertinentes
    const topCategories = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.category.toLowerCase());

    console.log('Analysis results:', {
      topCategories,
      scores: scores.sort((a, b) => b.score - a.score)
    });

    // S'assurer qu'il y a au moins une catégorie
    if (topCategories.length === 0) {
      topCategories.push('news');
    }

    // Ajouter "news" si la vidéo est récente (< 48h)
    const publishDate = new Date();
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    if (publishDate >= fortyEightHoursAgo && !topCategories.includes('news')) {
      topCategories.unshift('news');
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