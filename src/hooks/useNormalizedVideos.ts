import { useMemo } from "react";
import { type Video, type YouTubeVideo } from "@/types/video";
import { type VideoCategory } from "@/types/category";

const isValidCategory = (category: string): category is VideoCategory => {
  const validCategories = [
    "all", "news", "politics", "economy", "technology", 
    "culture", "personal_development", "humor", "music", 
    "entertainment", "travel", "documentary", "sport", 
    "finance", "tutorial", "kids", "movies"
  ];
  return validCategories.includes(category);
};

const sanitizeCategories = (categories: unknown): VideoCategory[] => {
  // Si categories est null ou undefined, retourner ["news"]
  if (!categories) {
    console.log("Categories is null or undefined, defaulting to ['news']");
    return ["news"];
  }

  // Si categories n'est pas un tableau, retourner ["news"]
  if (!Array.isArray(categories)) {
    console.log("Categories is not an array, defaulting to ['news']:", categories);
    return ["news"];
  }

  // Filtrer les catégories valides
  const validCategories = categories
    .filter((cat): cat is string => typeof cat === "string")
    .filter(isValidCategory);

  console.log("Sanitized categories:", {
    original: categories,
    valid: validCategories
  });

  return validCategories.length > 0 ? validCategories : ["news"];
};

export function useNormalizedVideos(dbVideos: Video[], youtubeVideos: YouTubeVideo[]) {
  return useMemo(() => {
    console.log("Normalizing videos:", {
      dbVideosCount: dbVideos?.length || 0,
      youtubeVideosCount: youtubeVideos?.length || 0
    });

    if (!dbVideos?.length && !youtubeVideos?.length) {
      console.log("No videos to normalize");
      return [];
    }

    // Normaliser les vidéos YouTube
    const normalizedYoutubeVideos: Video[] = (youtubeVideos || []).map((video) => {
      console.log("Normalizing YouTube video:", video.id);
      
      return {
        id: video.id,
        youtube_video_id: video.id,
        title: video.title,
        custom_title: null,
        summary: video.description || null,
        thumbnail_url: video.thumbnail || null,
        published_date: video.publishedAt,
        video_url: `https://www.youtube.com/watch?v=${video.id}`,
        categories: ["news"] as VideoCategory[],
        created_at: new Date().toISOString(),
        speakers_list: null,
        full_transcript: null,
        podcaster_id: null,
        article_content: null,
        podcaster: null,
        stats: video.statistics ? {
          id: crypto.randomUUID(),
          video_id: video.id,
          view_count: parseInt(video.statistics.viewCount || "0", 10),
          like_count: parseInt(video.statistics.likeCount || "0", 10),
          share_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : null
      };
    });

    // Normaliser les vidéos de la base de données
    const normalizedDbVideos = (dbVideos || []).map((video) => {
      console.log("Normalizing DB video:", {
        id: video.id,
        categories: video.categories
      });
      
      return {
        ...video,
        categories: sanitizeCategories(video.categories)
      };
    });

    // Combiner les vidéos en évitant les doublons
    const allVideos = [...normalizedDbVideos];
    
    // Ajouter uniquement les vidéos YouTube qui n'existent pas déjà dans la DB
    normalizedYoutubeVideos.forEach((ytVideo) => {
      const exists = allVideos.some(
        (dbVideo) => dbVideo.youtube_video_id === ytVideo.youtube_video_id
      );
      if (!exists) {
        allVideos.push(ytVideo);
      }
    });

    console.log("Final normalized videos count:", allVideos.length);
    return allVideos;
  }, [dbVideos, youtubeVideos]);
}