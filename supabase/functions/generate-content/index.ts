import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.1.0';

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
    console.log('Generating content for video:', videoId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Si pas de transcription, on la génère
    if (!transcript) {
      console.log('No transcript provided, fetching video details...');
      const { data: video } = await supabaseClient
        .from('videos')
        .select('youtube_video_id')
        .eq('id', videoId)
        .single();

      if (!video) {
        throw new Error('Video not found');
      }

      // Obtenir l'audio de la vidéo
      const { data: audioData } = await supabaseClient.functions.invoke('get-youtube-audio', {
        body: { videoId: video.youtube_video_id }
      });

      if (!audioData?.audioUrl) {
        throw new Error('Failed to get audio URL');
      }

      // Transcrire l'audio
      console.log('Transcribing audio...');
      const { data: transcriptionData } = await supabaseClient.functions.invoke('transcribe-with-whisper', {
        body: { audioUrl: audioData.audioUrl }
      });

      if (!transcriptionData?.text) {
        throw new Error('Transcription failed');
      }

      // Mettre à jour la transcription dans la base de données
      const { error: updateError } = await supabaseClient
        .from('videos')
        .update({ full_transcript: transcriptionData.text })
        .eq('id', videoId);

      if (updateError) {
        throw updateError;
      }

      console.log('Transcript generated and saved');
    }

    // Générer le résumé avec GPT-4
    console.log('Generating summary...');
    const summaryCompletion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant spécialisé dans la création de résumés concis et informatifs."
        },
        {
          role: "user",
          content: `Crée un résumé clair et concis de cette transcription de vidéo intitulée "${title}": ${transcript}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const summary = summaryCompletion.data.choices[0]?.message?.content;
    console.log('Summary generated');

    // Générer l'article avec GPT-4
    console.log('Generating article...');
    const articleCompletion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un journaliste professionnel qui écrit des articles détaillés et bien structurés."
        },
        {
          role: "user",
          content: `Écris un article détaillé basé sur cette transcription de vidéo. Titre: "${title}". Transcription: ${transcript}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const article = articleCompletion.data.choices[0]?.message?.content;
    console.log('Article generated');

    // Mettre à jour la vidéo avec le nouveau contenu
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

    console.log('Content saved successfully');

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