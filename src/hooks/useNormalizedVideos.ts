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
  if (!Array.isArray(categories)) return ["news"];
  
  const validCategories = categories
    .filter((cat): cat is string => typeof cat === "string")
    .filter(isValidCategory);
  
  return validCategories.length > 0 ? validCategories : ["news"];
};

export function useNormalizedVideos(dbVideos: Video[], youtubeVideos: YouTubeVideo[]) {
  return useMemo(() => {
    console.log("Normalizing videos from DB:", dbVideos);
    console.log("Normalizing videos from YouTube:", youtubeVideos);

    // Normaliser les vidéos YouTube
    const normalizedYoutubeVideos: Video[] = youtubeVideos.map((video) => ({
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
    }));

    // Normaliser les vidéos de la base de données
    const normalizedDbVideos = dbVideos.map((video) => ({
      ...video,
      categories: sanitizeCategories(video.categories)
    }));

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

    console.log("Combined normalized videos:", allVideos);
    return allVideos;
  }, [dbVideos, youtubeVideos]);
}