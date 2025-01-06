import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const { transcript, summary, videoId } = await req.json();

    if (!transcript || !videoId) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Generate article using GPT-4
    const prompt = `
      Based on the following video transcript and summary, write a professional article:
      
      Summary: ${summary}
      
      Transcript: ${transcript}
      
      Write a well-structured article that:
      1. Has a compelling headline
      2. Includes an introduction
      3. Contains main points with subheadings
      4. Provides a conclusion
      5. Maintains a professional tone
      6. Is engaging and informative
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional journalist writing an article based on video content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const article = completion.data.choices[0]?.message?.content;

    if (!article) {
      throw new Error('Failed to generate article');
    }

    // Store the article in Supabase
    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({ article_content: article })
      .eq('id', videoId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ article }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});