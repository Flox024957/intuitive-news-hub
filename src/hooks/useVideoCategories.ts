import { useMemo } from "react";
import { type Video } from "@/types/video";

export function useVideoCategories(videos: Video[], selectedCategory: string) {
  return useMemo(() => {
    console.log("useVideoCategories - Processing videos:", {
      totalVideos: videos?.length,
      selectedCategory
    });

    if (!videos) return [];

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    return videos.filter(video => {
      // Pour la section News, vérifier si la vidéo a moins de 48h
      if (selectedCategory.toLowerCase() === "news") {
        const publishDate = new Date(video.published_date);
        const isRecent = publishDate >= fortyEightHoursAgo;
        console.log("Checking if video is recent:", {
          title: video.title,
          publishDate,
          isRecent
        });
        return isRecent;
      }

      // Pour les autres catégories, vérifier si la vidéo a le tag correspondant
      if (selectedCategory.toLowerCase() === "all") return true;

      const normalizedCategories = video.categories?.map(cat => cat.toLowerCase()) || [];
      const hasCategory = normalizedCategories.includes(selectedCategory.toLowerCase());

      console.log("Checking video categories:", {
        title: video.title,
        categories: normalizedCategories,
        selectedCategory: selectedCategory.toLowerCase(),
        hasCategory
      });

      return hasCategory;
    });
  }, [videos, selectedCategory]);
}