import { useYoutubeVideos } from "@/hooks/useYoutubeVideos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface YouTubeChannel {
  id: string;
  categories: string[];
}

// Liste vide des chaînes YouTube
const YOUTUBE_CHANNELS: YouTubeChannel[] = [];

export async function addNewYouTubeChannel(channelId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-youtube-channel', {
      body: { 
        channelId,
        excludeShorts: true
      }
    });

    if (error) {
      console.error('Error analyzing channel:', error);
      toast.error("Erreur lors de l'analyse de la chaîne YouTube");
      return false;
    }

    // Pour chaque vidéo, traiter le contenu (transcription, résumé, article)
    for (const video of data.videos) {
      try {
        const { data: transcriptionData } = await supabase.functions.invoke('transcribe-video', {
          body: { videoId: video.id }
        });

        if (transcriptionData?.transcript) {
          const { data: summaryData } = await supabase.functions.invoke('generate-summary', {
            body: { 
              text: transcriptionData.transcript,
              videoId: video.id
            }
          });

          const { data: articleData } = await supabase.functions.invoke('generate-article', {
            body: {
              transcript: transcriptionData.transcript,
              summary: summaryData?.summary,
              videoId: video.id
            }
          });

          console.log(`Content generated for video ${video.id}:`, {
            transcription: !!transcriptionData?.transcript,
            summary: !!summaryData?.summary,
            article: !!articleData?.article
          });
        }
      } catch (processError) {
        console.error(`Error processing video ${video.id}:`, processError);
        toast.error(`Erreur lors du traitement de la vidéo ${video.title}`);
      }
    }

    toast.success("Chaîne YouTube ajoutée avec succès !");
    return true;
  } catch (error) {
    console.error('Error:', error);
    toast.error("Erreur lors de l'ajout de la chaîne");
    return false;
  }
}

export function useYouTubeVideos() {
  const channelsData = YOUTUBE_CHANNELS.map(channel => {
    const { data, isLoading } = useYoutubeVideos(channel.id);
    return {
      videos: data?.map(video => ({
        ...video,
        categories: determineVideoCategories(video.title, video.summary || '', channel.categories)
      })) || [],
      isLoading
    };
  });

  const allVideos = channelsData.flatMap(channel => channel.videos);
  const isLoading = channelsData.some(channel => channel.isLoading);

  return { videos: allVideos, isLoading };
}

function determineVideoCategories(title: string, description: string, defaultCategories: string[]): string[] {
  const content = (title + " " + description).toLowerCase();
  
  const categoryKeywords = {
    Politics: [
      "politique", "gouvernement", "élection", "président", "ministre", "assemblée",
      "parlement", "démocratie", "loi", "réforme", "état", "constitution",
      "député", "sénat", "vote", "électeur", "campagne", "parti"
    ],
    Economy: [
      "économie", "finance", "marché", "entreprise", "croissance", "inflation",
      "investissement", "bourse", "budget", "commerce", "emploi", "pib",
      "dette", "banque", "monnaie", "euro", "dollar", "crise"
    ],
    Science: [
      "science", "recherche", "découverte", "étude", "laboratoire", "expérience",
      "scientifique", "biologie", "physique", "chimie", "théorie", "cerveau",
      "neuroscience", "cognition", "intelligence", "évolution", "nature"
    ],
    Technology: [
      "technologie", "innovation", "numérique", "intelligence artificielle", "ia",
      "robot", "internet", "digital", "informatique", "tech", "application",
      "algorithme", "données", "cybersécurité", "blockchain", "startup"
    ],
    Culture: [
      "culture", "art", "musique", "cinéma", "littérature", "théâtre",
      "exposition", "spectacle", "festival", "patrimoine", "histoire",
      "philosophie", "société", "civilisation", "tradition"
    ],
    News: [
      "actualité", "information", "news", "journal", "média", "reportage",
      "événement", "direct", "breaking", "dernière minute", "analyse",
      "débat", "interview", "chronique", "édito"
    ]
  };

  const detectedCategories = new Set<string>();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        detectedCategories.add(category);
        break;
      }
    }
  }

  return detectedCategories.size > 0 
    ? Array.from(detectedCategories)
    : defaultCategories;
}