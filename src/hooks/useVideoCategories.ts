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

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Fonction pour détecter automatiquement les catégories basées sur le titre
    const detectCategories = (title: string): string[] => {
      const categories: string[] = [];
      const titleLower = title.toLowerCase();

      // Mots-clés pour chaque catégorie
      const categoryKeywords = {
        politics: ["politique", "gouvernement", "élection", "président", "ministre"],
        economy: ["économie", "finance", "marché", "entreprise", "croissance"],
        science: ["science", "recherche", "découverte", "étude", "laboratoire"],
        technology: ["technologie", "numérique", "intelligence artificielle", "digital", "tech"],
        culture: ["culture", "art", "musique", "cinéma", "littérature"],
        entertainment: ["divertissement", "spectacle", "film", "série", "show"],
      };

      // Détecter les catégories basées sur les mots-clés
      Object.entries(categoryKeywords).forEach(([category, keywords]) => {
        if (keywords.some(keyword => titleLower.includes(keyword))) {
          categories.push(category);
        }
      });

      return categories;
    };

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

      // Utiliser les catégories existantes ou détecter automatiquement
      let videoCategories = video.categories || [];
      if (videoCategories.length === 0) {
        videoCategories = detectCategories(video.title);
        if (videoCategories.length === 0) {
          videoCategories = ["news"]; // Catégorie par défaut
        }
      }

      const normalizedCategories = videoCategories.map(cat => cat.toLowerCase());
      const hasCategory = normalizedCategories.includes(selectedCategory.toLowerCase());

      console.log("Checking video categories:", {
        title: video.title,
        categories: normalizedCategories,
        selectedCategory: selectedCategory.toLowerCase(),
        hasCategory,
        detectedCategories: detectCategories(video.title)
      });

      return hasCategory;
    });
  }, [videos, selectedCategory]);
}