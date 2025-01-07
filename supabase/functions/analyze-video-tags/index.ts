import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { pipeline } from "https://esm.sh/@huggingface/transformers@3.2.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, summary } = await req.json();

    if (!title) {
      throw new Error('Title is required');
    }

    console.log('Analyzing video content:', { title, summary });

    // Create a zero-shot-classification pipeline with Meta's BART model
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

    // Combine title and summary for better context
    const content = `${title} ${summary || description || ''}`.trim();

    // Classify the content
    const result = await classifier(content, categories, {
      multi_label: true,
      hypothesis_template: "Cette vidéo parle de {}."
    });

    // Get top 3 categories based on scores with confidence > 30%
    const topCategories = result.labels
      .map((label, index) => ({
        label,
        score: result.scores[index]
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(item => item.score > 0.3)
      .map(item => item.label);

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