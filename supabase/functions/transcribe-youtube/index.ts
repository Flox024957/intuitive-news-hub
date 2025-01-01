import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY');
const API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";

async function downloadAudioFromYoutube(videoId: string): Promise<ArrayBuffer> {
  // Utiliser yt-dlp pour télécharger l'audio
  const process = new Deno.Command("yt-dlp", {
    args: [
      `https://www.youtube.com/watch?v=${videoId}`,
      "-f", "bestaudio",
      "-o", "-",
    ],
  });

  const { stdout } = await process.output();
  return stdout.buffer;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    console.log('ID vidéo reçu:', videoId);

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "ID de vidéo YouTube requis" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Télécharger l'audio de la vidéo
    console.log('Téléchargement de l\'audio...');
    const audioBuffer = await downloadAudioFromYoutube(videoId);
    console.log('Audio téléchargé avec succès');

    // Envoyer à Hugging Face pour transcription
    console.log('Envoi à Hugging Face pour transcription...');
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      method: "POST",
      body: audioBuffer,
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