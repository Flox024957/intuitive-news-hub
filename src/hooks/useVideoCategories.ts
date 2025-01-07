import { useMemo } from "react";
import { type Video } from "@/types/video";

export function useVideoCategories(videos: Video[], selectedCategory: string) {
  return useMemo(() => {
    console.log("useVideoCategories - Starting category filtering:", {
      totalVideos: videos?.length,
      selectedCategory,
      videosWithCategories: videos?.map(v => ({
        title: v.title,
        categories: v.categories,
        publishDate: v.published_date
      }))
    });

    if (!videos) return [];

    // Pour la section News, vérifier si la vidéo a moins de 48h
    if (selectedCategory.toLowerCase() === "news") {
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      
      return videos.filter(video => {
        const publishDate = new Date(video.published_date);
        const isRecent = publishDate >= fortyEightHoursAgo;
        
        console.log("Checking if video is recent:", {
          title: video.title,
          publishDate,
          isRecent,
          categories: video.categories
        });
        
        // Une vidéo est considérée comme "news" si elle a moins de 48h OU si elle est explicitement catégorisée comme "news"
        return isRecent || (video.categories && video.categories.includes('news'));
      });
    }

    // Pour les autres catégories
    return videos.filter(video => {
      if (selectedCategory.toLowerCase() === "all") return true;

      // Vérifier les catégories de la vidéo
      const videoCategories = Array.isArray(video.categories) 
        ? video.categories.map(cat => typeof cat === 'string' ? cat.toLowerCase() : '')
        : [];

      const hasCategory = videoCategories.includes(selectedCategory.toLowerCase());

      console.log("Video categorization:", {
        title: video.title,
        categories: videoCategories,
        selectedCategory: selectedCategory.toLowerCase(),
        matches: hasCategory
      });

      return hasCategory;
    });
  }, [videos, selectedCategory]);
}