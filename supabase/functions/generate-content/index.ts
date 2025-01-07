import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-2-70b-chat-hf";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript, title } = await req.json();
    console.log('Processing content generation for:', { title });

    if (!transcript) {
      throw new Error('Transcript is required for content generation');
    }

    const HF_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!HF_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not set');
    }

    // Générer le résumé
    console.log('Generating summary...');
    const summaryPrompt = `Tu es un assistant spécialisé dans la création de résumés concis et informatifs. 
    Crée un résumé en français de ce texte en 3-4 phrases maximum: ${transcript.substring(0, 2000)}`;
    
    const summaryResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: summaryPrompt,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          top_p: 0.9,
        }
      })
    });

    if (!summaryResponse.ok) {
      throw new Error(`Error generating summary: ${await summaryResponse.text()}`);
    }

    const summaryResult = await summaryResponse.json();
    const summary = summaryResult[0].generated_text;
    console.log('Summary generated:', summary);

    // Générer l'article
    console.log('Generating article...');
    const articlePrompt = `Tu es un assistant spécialisé dans la rédaction d'articles de blog informatifs et engageants.
    Écris un article en français structuré et détaillé basé sur ce titre et cette transcription.
    Titre: ${title}
    Transcription: ${transcript.substring(0, 4000)}`;

    const articleResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: articlePrompt,
        parameters: {
          max_length: 800,
          temperature: 0.8,
          top_p: 0.9,
        }
      })
    });

    if (!articleResponse.ok) {
      throw new Error(`Error generating article: ${await articleResponse.text()}`);
    }

    const articleResult = await articleResponse.json();
    const article = articleResult[0].generated_text;
    console.log('Article generated:', article);

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