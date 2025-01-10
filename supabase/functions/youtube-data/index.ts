import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, channelId } = await req.json();
    console.log('Processing request for:', { username, channelId });

    if (!username && !channelId) {
      throw new Error('Either username or channelId is required');
    }

    // D'abord obtenir l'ID de la chaîne si on a un nom d'utilisateur
    let finalChannelId = channelId;
    if (!channelId && username) {
      console.log('Fetching channel ID for username:', username);
      try {
        const channelResponse = await fetch(
          `https://youtube.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!channelResponse.ok) {
          const error = await channelResponse.json();
          console.error('Channel fetch error:', error);
          
          // Vérifier si c'est une erreur de quota
          if (error.error?.message?.includes('quota')) {
            return new Response(
              JSON.stringify({ 
                error: 'quotaExceeded',
                message: 'YouTube API quota exceeded. Please try again later.'
              }),
              { 
                status: 429,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                }
              }
            );
          }
          throw new Error(`Failed to fetch channel data: ${error.error?.message || 'Unknown error'}`);
        }

        const channelData = await channelResponse.json();
        console.log('Channel data received:', channelData);
        
        if (!channelData.items?.length) {
          console.log('Channel not found with forUsername, trying search...');
          const searchResponse = await fetch(
            `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${username}&type=channel&key=${YOUTUBE_API_KEY}`
          );

          if (!searchResponse.ok) {
            const error = await searchResponse.json();
            console.error('Channel search error:', error);
            
            // Vérifier si c'est une erreur de quota
            if (error.error?.message?.includes('quota')) {
              return new Response(
                JSON.stringify({ 
                  error: 'quotaExceeded',
                  message: 'YouTube API quota exceeded. Please try again later.'
                }),
                { 
                  status: 429,
                  headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                  }
                }
              );
            }
            throw new Error(`Failed to search channel: ${error.error?.message || 'Unknown error'}`);
          }

          const searchData = await searchResponse.json();
          console.log('Search results:', searchData);

          if (!searchData.items?.length) {
            throw new Error('Channel not found');
          }

          finalChannelId = searchData.items[0].id.channelId;
          console.log('Found channel ID from search:', finalChannelId);
        } else {
          finalChannelId = channelData.items[0].id;
          console.log('Found channel ID from username:', finalChannelId);
        }
      } catch (error) {
        if (error.message?.includes('quota')) {
          return new Response(
            JSON.stringify({ 
              error: 'quotaExceeded',
              message: 'YouTube API quota exceeded. Please try again later.'
            }),
            { 
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }
        throw error;
      }
    }

    if (!finalChannelId) {
      throw new Error('Could not determine channel ID');
    }

    // Obtenir les vidéos de la chaîne
    console.log('Fetching videos for channel:', finalChannelId);
    try {
      const videosResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${finalChannelId}&maxResults=50&order=date&type=video&key=${YOUTUBE_API_KEY}`
      );

      if (!videosResponse.ok) {
        const error = await videosResponse.json();
        console.error('Videos fetch error:', error);
        
        // Vérifier si c'est une erreur de quota
        if (error.error?.message?.includes('quota')) {
          return new Response(
            JSON.stringify({ 
              error: 'quotaExceeded',
              message: 'YouTube API quota exceeded. Please try again later.'
            }),
            { 
              status: 429,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }
        throw new Error(`Failed to fetch videos: ${error.error?.message || 'Unknown error'}`);
      }

      const videosData = await videosResponse.json();
      console.log(`Found ${videosData.items?.length || 0} videos`);
      
      if (!videosData.items?.length) {
        return new Response(
          JSON.stringify({ videos: [] }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            } 
          }
        );
      }
      
      // Obtenir les statistiques pour chaque vidéo
      const videoIds = videosData.items.map((item: any) => item.id.videoId).join(',');
      console.log('Fetching stats for videos:', videoIds);
      
      const statsResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );

      if (!statsResponse.ok) {
        const error = await statsResponse.json();
        console.error('Stats fetch error:', error);
        
        // Pour les statistiques, on continue même si on a une erreur de quota
        if (!error.error?.message?.includes('quota')) {
          throw new Error(`Failed to fetch video statistics: ${error.error?.message || 'Unknown error'}`);
        }
        console.warn('Quota exceeded for stats, continuing without them');
      }

      const statsData = await statsResponse.json();
      console.log('Stats received for', statsData.items?.length || 0, 'videos');

      // Combiner les données
      const videos = videosData.items.map((item: any) => {
        const stats = statsData?.items?.find((stat: any) => stat.id === item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          statistics: stats?.statistics
        };
      });

      console.log(`Successfully processed ${videos.length} videos`);

      return new Response(
        JSON.stringify({ videos }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    } catch (error) {
      if (error.message?.includes('quota')) {
        return new Response(
          JSON.stringify({ 
            error: 'quotaExceeded',
            message: 'YouTube API quota exceeded. Please try again later.'
          }),
          { 
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in youtube-data function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: error instanceof Error && error.message === 'Channel not found' ? 404 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});