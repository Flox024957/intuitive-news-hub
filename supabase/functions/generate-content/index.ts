import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript, title } = await req.json();
    console.log('Generating content for:', { title });

    if (!transcript) {
      throw new Error('Transcript is required for content generation');
    }

    // Simuler la génération de résumé (à remplacer par l'appel à l'API Hugging Face)
    const summary = `Résumé automatique de : ${title}\n\n${transcript.substring(0, 200)}...`;
    
    // Simuler la génération d'article
    const article = `Article généré à partir de : ${title}\n\n${transcript.substring(0, 500)}...`;

    console.log('Content generation completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: summary,
        article: article
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});