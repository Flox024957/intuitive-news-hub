import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcript, title, summary } = await req.json()

    if (!transcript || !title) {
      throw new Error('Transcript et titre sont requis')
    }

    const prompt = `
    En tant que journaliste professionnel, écris un article de presse basé sur cette transcription vidéo.
    
    Titre de la vidéo: ${title}
    
    Résumé: ${summary}
    
    Transcription: ${transcript.substring(0, 3000)}...
    
    Écris un article journalistique structuré qui:
    1. A un titre accrocheur
    2. Commence par un chapô (résumé introductif)
    3. Développe les points principaux
    4. Inclut des citations pertinentes de la transcription
    5. Conclut avec une mise en perspective
    
    Format: Article de presse professionnel
    Style: Objectif et informatif
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un journaliste professionnel qui écrit des articles de presse de haute qualité.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de l\'article')
    }

    const result = await response.json()
    const article = result.choices[0].message.content

    return new Response(
      JSON.stringify({ article }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})