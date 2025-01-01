import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const HF_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY');
const API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl } = await req.json();
    console.log('URL audio reçue:', audioUrl);

    if (!audioUrl) {
      return new Response(
        JSON.stringify({ error: "URL audio requise" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Récupérer l'audio depuis l'URL
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();

    // Envoyer à Hugging Face pour transcription
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      method: "POST",
      body: audioBlob,
    });

    const result = await response.json();
    console.log('Résultat de la transcription:', result);

    return new Response(
      JSON.stringify({ transcription: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur lors de la transcription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});