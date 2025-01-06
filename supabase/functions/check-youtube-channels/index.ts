import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { processYouTubeVideos } from './utils/videoProcessor.ts'
import { analyzeContent } from './utils/contentAnalyzer.ts'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
    
    // Get all podcasters
    const { data: podcasters, error: podcastersError } = await supabase
      .from('podcasters')
      .select('*')
    
    if (podcastersError) throw podcastersError
    
    console.log(`Processing ${podcasters?.length || 0} podcasters`)
    
    for (const podcaster of podcasters || []) {
      try {
        console.log(`Processing podcaster: ${podcaster.name}`)
        
        // Get videos for this channel
        const videos = await processYouTubeVideos(podcaster.youtube_channel_id)
        
        for (const video of videos) {
          // Check if video already exists
          const { data: existingVideo } = await supabase
            .from('videos')
            .select('id')
            .eq('youtube_video_id', video.id)
            .single()
            
          if (existingVideo) {
            console.log(`Video ${video.id} already exists, skipping`)
            continue
          }
          
          // Analyze content and determine categories
          const categories = analyzeContent(video.title, video.description)
          
          // Insert new video
          const { data: newVideo, error: videoError } = await supabase
            .from('videos')
            .insert({
              youtube_video_id: video.id,
              title: video.title,
              summary: video.description,
              published_date: video.publishedAt,
              thumbnail_url: video.thumbnail,
              podcaster_id: podcaster.id,
              video_url: `https://www.youtube.com/watch?v=${video.id}`,
              categories
            })
            .select()
            .single()
            
          if (videoError) throw videoError
          
          // Initialize video stats
          await supabase
            .from('video_stats')
            .insert({
              video_id: newVideo.id,
              view_count: parseInt(video.statistics?.viewCount || '0'),
              like_count: parseInt(video.statistics?.likeCount || '0')
            })
          
          // Process transcription and content
          await processVideoContent(newVideo.id, video.id)
        }
      } catch (error) {
        console.error(`Error processing podcaster ${podcaster.name}:`, error)
      }
    }
    
    return new Response(
      JSON.stringify({ success: true }),
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

async function processVideoContent(videoId: string, youtubeVideoId: string) {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  
  try {
    // Get audio URL and transcribe
    const { data: audioData } = await supabase.functions.invoke('get-youtube-audio', {
      body: { videoId: youtubeVideoId }
    })
    
    if (!audioData?.audioUrl) {
      throw new Error('No audio URL returned')
    }
    
    // Transcribe audio
    const { data: transcriptionData } = await supabase.functions.invoke('transcribe-with-whisper', {
      body: { audioUrl: audioData.audioUrl }
    })
    
    if (!transcriptionData?.text) {
      throw new Error('Transcription failed')
    }
    
    // Generate summary
    const { data: summaryData } = await supabase.functions.invoke('generate-summary', {
      body: { text: transcriptionData.text }
    })
    
    // Generate article
    const { data: articleData } = await supabase.functions.invoke('generate-article', {
      body: {
        transcript: transcriptionData.text,
        summary: summaryData?.summary,
        videoId
      }
    })
    
    // Update video with processed content
    await supabase
      .from('videos')
      .update({
        full_transcript: transcriptionData.text,
        summary: summaryData?.summary,
        article_content: articleData?.article
      })
      .eq('id', videoId)
    
  } catch (error) {
    console.error(`Error processing content for video ${youtubeVideoId}:`, error)
    throw error
  }
}