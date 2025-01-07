import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { videoId, transcript, title } = await req.json();
    console.log('Processing enhanced content generation for:', { videoId, title });

    if (!transcript) {
      throw new Error('Transcript is required for content generation');
    }

    const HF_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!HF_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not set');
    }

    // Générer le résumé
    console.log('Generating enhanced summary...');
    const summaryPrompt = `En tant qu'expert en analyse de contenu, crée un résumé structuré et informatif de cette transcription en français.
    Concentre-toi sur les points clés, les arguments principaux et les conclusions.
    
    Transcription: ${transcript.substring(0, 2000)}
    
    Format souhaité:
    - 3-4 phrases maximum
    - Inclure les thèmes principaux
    - Mentionner les conclusions importantes
    - Utiliser un langage clair et précis`;
    
    const summaryResponse = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: summaryPrompt,
        parameters: {
          max_length: 250,
          temperature: 0.7,
          top_p: 0.9,
        }
      })
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error('Summary generation error:', errorText);
      throw new Error(`Error generating summary: ${errorText}`);
    }

    const summaryResult = await summaryResponse.json();
    console.log('Raw summary response:', summaryResult);
    const summary = summaryResult.generated_text; // Fixed: Access directly without array indexing
    console.log('Enhanced summary generated:', summary);

    // Générer l'article
    console.log('Generating enhanced article...');
    const articlePrompt = `En tant qu'expert en rédaction journalistique, crée un article approfondi et structuré en français basé sur cette transcription.
    
    Titre: ${title}
    Transcription: ${transcript.substring(0, 4000)}
    
    Format souhaité:
    1. Introduction captivante
    2. Développement structuré avec sous-titres
    3. Analyse approfondie des points clés
    4. Citations pertinentes de la transcription
    5. Conclusion synthétique
    6. Style journalistique professionnel`;

    const articleResponse = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: articlePrompt,
        parameters: {
          max_length: 1000,
          temperature: 0.8,
          top_p: 0.9,
        }
      })
    });

    if (!articleResponse.ok) {
      const errorText = await articleResponse.text();
      console.error('Article generation error:', errorText);
      throw new Error(`Error generating article: ${errorText}`);
    }

    const articleResult = await articleResponse.json();
    console.log('Raw article response:', articleResult);
    const article = articleResult.generated_text; // Fixed: Access directly without array indexing
    console.log('Enhanced article generated:', article);

    // Mise à jour de la base de données avec le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({
        summary,
        article_content: article
      })
      .eq('id', videoId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Content successfully generated and stored for video:', videoId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary,
        article
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in enhanced-content-generation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});