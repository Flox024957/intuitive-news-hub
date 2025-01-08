import { useMemo } from "react";
import { type Video, type YouTubeVideo, type NormalizedVideo } from "@/types/video";
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
  if (!categories) {
    console.log("Categories is null or undefined, defaulting to ['news']");
    return ["news"];
  }

  if (!Array.isArray(categories)) {
    console.log("Categories is not an array, defaulting to ['news']:", categories);
    return ["news"];
  }

  const validCategories = categories
    .filter((cat): cat is string => typeof cat === "string")
    .filter(isValidCategory);

  console.log("Sanitized categories:", {
    original: categories,
    valid: validCategories
  });

  return validCategories.length > 0 ? validCategories : ["news"];
};

export function useNormalizedVideos(dbVideos: Video[], youtubeVideos: NormalizedVideo[]): NormalizedVideo[] {
  return useMemo(() => {
    console.log("Normalizing videos:", {
      dbVideosCount: dbVideos?.length || 0,
      youtubeVideosCount: youtubeVideos?.length || 0
    });

    if (!dbVideos?.length && !youtubeVideos?.length) {
      console.log("No videos to normalize");
      return [];
    }

    const normalizedYoutubeVideos = (youtubeVideos || []).map((video): Video => {
      if ('youtube_video_id' in video) return video as Video;
      
      const ytVideo = video as YouTubeVideo;
      console.log("Normalizing YouTube video:", ytVideo.id);
      
      return {
        id: ytVideo.id,
        youtube_video_id: ytVideo.id,
        title: ytVideo.title,
        custom_title: null,
        summary: ytVideo.description || null,
        thumbnail_url: ytVideo.thumbnail || null,
        published_date: ytVideo.publishedAt,
        video_url: `https://www.youtube.com/watch?v=${ytVideo.id}`,
        categories: ["news"] as VideoCategory[],
        created_at: new Date().toISOString(),
        speakers_list: null,
        full_transcript: null,
        podcaster_id: null,
        article_content: null,
        podcaster: null,
        stats: ytVideo.statistics ? {
          id: crypto.randomUUID(),
          video_id: ytVideo.id,
          view_count: parseInt(ytVideo.statistics.viewCount || "0", 10),
          like_count: parseInt(ytVideo.statistics.likeCount || "0", 10),
          share_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : null
      };
    });

    const normalizedDbVideos = (dbVideos || []).map((video) => ({
      ...video,
      categories: sanitizeCategories(video.categories)
    }));

    const allVideos = [...normalizedDbVideos];
    
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