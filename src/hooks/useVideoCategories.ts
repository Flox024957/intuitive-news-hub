import { useMemo } from "react";
import { type Video } from "@/types/video";

export function useVideoCategories(videos: Video[], selectedCategory: string) {
  return useMemo(() => {
    if (!videos) return [];

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    return videos.filter(video => {
      // Pour la section News, vérifier si la vidéo a moins de 48h
      if (selectedCategory === "News") {
        const publishDate = new Date(video.published_date);
        return publishDate >= fortyEightHoursAgo;
      }

      // Pour les autres catégories, vérifier si la vidéo a le tag correspondant
      if (selectedCategory === "all") return true;

      return video.categories?.includes(selectedCategory);
    });
  }, [videos, selectedCategory]);
}