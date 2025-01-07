import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { pipeline } from "@huggingface/transformers";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    if (!title) {
      throw new Error('Title is required');
    }

    console.log('Analyzing video:', { title, description });

    // Create a zero-shot-classification pipeline
    const classifier = await pipeline(
      "zero-shot-classification",
      "facebook/bart-large-mnli",
      { device: "cpu" }
    );

    // Define our categories
    const categories = [
      "Actualités",
      "Politique",
      "Science",
      "Technologie",
      "Économie",
      "Culture",
      "Divertissement",
      "Tutoriels",
      "Humour",
      "Musique",
      "Développement"
    ];

    // Combine title and description for better context
    const content = `${title} ${description || ''}`;

    // Classify the content
    const result = await classifier(content, categories, {
      multi_label: true,
    });

    // Get top 3 categories based on scores
    const topCategories = result.labels
      .map((label, index) => ({
        label,
        score: result.scores[index]
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.label)
      .filter(label => result.scores[result.labels.indexOf(label)] > 0.3); // Only keep categories with confidence > 30%

    console.log('AI Analysis Result:', {
      content,
      categories: topCategories,
      scores: result.scores
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