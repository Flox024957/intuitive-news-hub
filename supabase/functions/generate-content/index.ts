import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { pipeline } from "@huggingface/transformers";

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

    // Initialiser le pipeline de génération de texte
    console.log('Initializing text generation pipeline...');
    const generator = await pipeline(
      'text-generation',
      'facebook/opt-350m',
      { device: "cpu" }
    );

    // Générer le résumé
    console.log('Generating summary...');
    const summaryPrompt = `Summarize this text in French: ${transcript.substring(0, 1000)}...`;
    const summaryResult = await generator(summaryPrompt, {
      max_length: 150,
      num_return_sequences: 1
    });
    const summary = summaryResult[0].generated_text;

    // Générer l'article
    console.log('Generating article...');
    const articlePrompt = `Write a detailed article in French based on this title and transcript: Title: ${title}, Transcript: ${transcript.substring(0, 2000)}...`;
    const articleResult = await generator(articlePrompt, {
      max_length: 500,
      num_return_sequences: 1
    });
    const article = articleResult[0].generated_text;

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