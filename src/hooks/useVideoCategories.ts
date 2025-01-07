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

    // Pour la catégorie "All", retourner toutes les vidéos
    if (selectedCategory.toLowerCase() === "all") {
      return videos;
    }

    // Pour la section News, vérifier si la vidéo a moins de 48h ou le tag news
    if (selectedCategory.toLowerCase() === "news") {
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      
      return videos.filter(video => {
        const publishDate = new Date(video.published_date);
        const isRecent = publishDate >= fortyEightHoursAgo;
        const hasNewsTag = video.categories?.some(cat => 
          cat.toLowerCase() === 'news' || 
          cat.toLowerCase() === 'actualités'
        );
        
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
      if (!video.categories) return false;

      // Normaliser les catégories pour la comparaison
      const normalizedCategories = video.categories.map(cat => 
        typeof cat === 'string' ? cat.toLowerCase() : ''
      );

      const selectedCategoryLower = selectedCategory.toLowerCase();

      // Correspondances de catégories (français/anglais)
      const categoryMappings: Record<string, string[]> = {
        'politics': ['politics', 'politique'],
        'economy': ['economy', 'économie'],
        'science': ['science'],
        'technology': ['technology', 'technologie'],
        'culture': ['culture'],
        'entertainment': ['entertainment', 'divertissement']
      };

      // Vérifier si la vidéo appartient à la catégorie sélectionnée
      const matchingCategories = categoryMappings[selectedCategoryLower] || 
                               [selectedCategoryLower];

      const hasCategory = normalizedCategories.some(cat =>
        matchingCategories.includes(cat)
      );

      console.log("Video categorization:", {
        title: video.title,
        normalizedCategories,
        selectedCategory: selectedCategoryLower,
        matches: hasCategory
      });

      return hasCategory;
    });
  }, [videos, selectedCategory]);
}