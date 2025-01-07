import { useMemo } from "react";
import { type Video } from "@/types/video";

export function useVideoCategories(videos: Video[], selectedCategory: string) {
  return useMemo(() => {
    console.log("useVideoCategories - Processing videos:", {
      totalVideos: videos?.length,
      selectedCategory,
      videosWithCategories: videos?.map(v => ({
        title: v.title,
        categories: v.categories
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
          isRecent
        });
        
        return isRecent;
      });
    }

    // Pour les autres catégories
    return videos.filter(video => {
      if (selectedCategory.toLowerCase() === "all") return true;

      // Normaliser les catégories de la vidéo
      const videoCategories = Array.isArray(video.categories) 
        ? video.categories.map(cat => typeof cat === 'string' ? cat.toLowerCase() : '')
        : [];

      // Si pas de catégories, analyser le titre et le résumé
      if (videoCategories.length === 0) {
        const content = `${video.title} ${video.summary}`.toLowerCase();
        const categoryKeywords: Record<string, string[]> = {
          'politics': ['politique', 'gouvernement', 'élection', 'président'],
          'economy': ['économie', 'finance', 'marché', 'entreprise'],
          'science': ['science', 'recherche', 'découverte', 'étude'],
          'technology': ['technologie', 'numérique', 'digital', 'tech'],
          'culture': ['culture', 'art', 'musique', 'cinéma'],
          'entertainment': ['divertissement', 'spectacle', 'film', 'série']
        };

        // Détecter la catégorie basée sur les mots-clés
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some(keyword => content.includes(keyword))) {
            videoCategories.push(category);
            break;
          }
        }

        // Si toujours pas de catégorie, mettre dans "news"
        if (videoCategories.length === 0) {
          videoCategories.push("news");
        }
      }

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