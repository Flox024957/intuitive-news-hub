import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer toutes les vidéos qui n'ont pas encore de contenu généré
    const { data: videos, error: fetchError } = await supabaseClient
      .from('videos')
      .select('*')
      .is('article_content', null)
      .is('custom_title', null)
      .order('published_date', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${videos?.length || 0} videos to process`);

    const results = [];
    for (const video of videos || []) {
      try {
        console.log(`Processing video: ${video.id}`);
        
        // Appeler la fonction de génération de contenu pour chaque vidéo
        const { data: contentData, error: contentError } = await supabaseClient.functions.invoke(
          'enhanced-content-generation',
          {
            body: {
              videoId: video.id,
              title: video.title,
              transcript: video.full_transcript || video.summary || ''
            }
          }
        );

        if (contentError) {
          console.error(`Error processing video ${video.id}:`, contentError);
          results.push({ id: video.id, status: 'error', error: contentError.message });
          continue;
        }

        results.push({ id: video.id, status: 'success' });
        console.log(`Successfully processed video: ${video.id}`);

      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
        results.push({ id: video.id, status: 'error', error: error.message });
      }

      // Attendre un peu entre chaque requête pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in batch-process-videos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});