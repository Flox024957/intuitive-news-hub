import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { HF_HEADERS, HF_SUMMARIZATION_URL } from "../_shared/huggingface.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    console.log('Generating summary for text length:', text.length);

    if (!text) {
      throw new Error('Text content is required');
    }

    const response = await fetch(HF_SUMMARIZATION_URL, {
      method: 'POST',
      headers: HF_HEADERS(Deno.env.get('HUGGING_FACE_API_KEY') || ''),
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: 250,
          min_length: 100,
          do_sample: false
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`Hugging Face API error: ${errorText}`);
    }

    const result = await response.json();
    console.log('Summary generated successfully');

    return new Response(
      JSON.stringify({ summary: result[0].summary_text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Summary generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});