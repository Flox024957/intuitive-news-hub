import { useMemo } from "react";
import { type Video } from "@/types/video";
import { type VideoCategory } from "@/types/category";

export function useVideoCategories(videos: Video[], selectedCategory: VideoCategory) {
  return useMemo(() => {
    if (!videos?.length) {
      console.log("No videos provided to useVideoCategories");
      return [];
    }

    console.log("useVideoCategories - Starting category filtering:", {
      totalVideos: videos.length,
      selectedCategory
    });

    // Pour la catégorie "All", retourner toutes les vidéos
    if (selectedCategory === "all") {
      return videos;
    }

    // Pour la section News, vérifier si la vidéo a moins de 48h ou le tag news
    if (selectedCategory === "news") {
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      
      return videos.filter(video => {
        const publishDate = new Date(video.published_date);
        const isRecent = publishDate >= fortyEightHoursAgo;
        const hasNewsTag = Array.isArray(video.categories) && video.categories.includes("news");
        
        console.log("Checking if video is news:", {
          title: video.title,
          publishDate,
          isRecent,
          hasNewsTag,
          categories: video.categories
        });
        
        return isRecent || hasNewsTag;
      });
    }

    // Pour les autres catégories
    return videos.filter(video => {
      if (!Array.isArray(video.categories)) {
        console.log(`Invalid categories for video ${video.title}:`, video.categories);
        return false;
      }

      const hasCategory = video.categories.includes(selectedCategory);

      console.log("Video categorization:", {
        title: video.title,
        categories: video.categories,
        selectedCategory,
        matches: hasCategory
      });

      return hasCategory;
    });
  }, [videos, selectedCategory]);
}