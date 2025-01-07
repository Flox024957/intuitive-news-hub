import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { HF_HEADERS, HF_SUMMARIZATION_URL } from "../_shared/huggingface.ts";

const ARTICLE_GENERATION_URL = "https://api-inference.huggingface.co/models/bigscience/bloomz";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { videoId, transcript, title } = await req.json();
    console.log('Generating content for video:', videoId);

    if (!transcript || !title) {
      throw new Error('Transcript and title are required');
    }

    // Générer le résumé avec le modèle de résumé
    console.log('Generating summary...');
    const summaryResponse = await fetch(HF_SUMMARIZATION_URL, {
      method: 'POST',
      headers: HF_HEADERS(Deno.env.get('HUGGING_FACE_API_KEY') || ''),
      body: JSON.stringify({
        inputs: transcript,
        parameters: {
          max_length: 250,
          min_length: 100,
          do_sample: false
        }
      }),
    });

    if (!summaryResponse.ok) {
      throw new Error(`Error generating summary: ${await summaryResponse.text()}`);
    }

    const summaryResult = await summaryResponse.json();
    const summary = summaryResult[0].summary_text;
    console.log('Summary generated successfully');

    // Générer l'article avec BLOOMZ
    console.log('Generating article...');
    const prompt = `En tant que journaliste professionnel, écris un article détaillé basé sur ce contenu:
    
    Titre: ${title}
    
    Résumé: ${summary}
    
    Contenu: ${transcript.slice(0, 2000)}  // Limiter la longueur pour éviter les dépassements de tokens
    
    Format attendu:
    1. Un titre accrocheur
    2. Une introduction captivante
    3. Le développement avec des sous-titres
    4. Une conclusion
    
    Utilise un style journalistique professionnel et objectif.`;

    const articleResponse = await fetch(ARTICLE_GENERATION_URL, {
      method: 'POST',
      headers: HF_HEADERS(Deno.env.get('HUGGING_FACE_API_KEY') || ''),
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      }),
    });

    if (!articleResponse.ok) {
      throw new Error(`Error generating article: ${await articleResponse.text()}`);
    }

    const articleResult = await articleResponse.json();
    const article = articleResult[0].generated_text;
    console.log('Article generated successfully');

    // Mettre à jour la vidéo avec le nouveau contenu
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({
        summary: summary,
        article_content: article
      })
      .eq('id', videoId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, summary, article }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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