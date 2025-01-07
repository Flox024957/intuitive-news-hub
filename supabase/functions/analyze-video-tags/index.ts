import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, description } = await req.json()

    if (!title) {
      throw new Error('Title is required')
    }

    console.log('Analyzing video:', { title, description })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a video content analyzer. Your task is to analyze video titles and descriptions to assign the most relevant categories (maximum 3) from this list:
              - News (Actualités)
              - Politics (Politique)
              - Science
              - Technology (Technologie)
              - Economy (Économie)
              - Culture
              - Entertainment (Divertissement)
              - Tutorials (Tutoriels)
              - Humor (Humour)
              - Music (Musique)
              - Development (Développement)
              
              Respond ONLY with an array of categories in French, no other text.
              Example response: ["Actualités", "Politique", "Économie"]`
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description || ''}`
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    })

    const data = await response.json()
    console.log('AI Response:', data)

    let categories = []
    try {
      // Parse the AI response which should be a string representation of an array
      categories = JSON.parse(data.choices[0].message.content)
      
      // Ensure we have valid categories and limit to 3
      categories = categories
        .filter(cat => typeof cat === 'string')
        .slice(0, 3)
    } catch (error) {
      console.error('Error parsing AI response:', error)
      categories = ['News'] // Fallback category
    }

    return new Response(
      JSON.stringify({ categories }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})