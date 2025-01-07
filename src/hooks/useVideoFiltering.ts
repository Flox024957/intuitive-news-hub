import { useMemo } from "react";
import { type SortOption } from "@/components/SortOptions";
import { type Video } from "@/types/video";

interface VideoFilteringProps {
  videos: Video[];
  searchTerm: string;
  selectedCategory: string;
  sortOption: SortOption;
}

export function useVideoFiltering({
  videos,
  searchTerm,
  selectedCategory,
  sortOption,
}: VideoFilteringProps) {
  return useMemo(() => {
    console.log("Starting video filtering with:", {
      totalVideos: videos?.length,
      searchTerm,
      selectedCategory,
      sortOption,
      videosWithCategories: videos?.map(v => ({
        title: v.title,
        categories: v.categories
      }))
    });

    if (!videos) return [];

    // Filtrage
    const filteredVideos = videos.filter((video) => {
      if (!video) return false;

      // Filtre de recherche
      const matchesSearch =
        !searchTerm ||
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.summary?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre de catégorie
      let matchesCategory = true;
      if (selectedCategory.toLowerCase() !== "all") {
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const publishDate = new Date(video.published_date);

        // Vérifier si c'est une news (moins de 48h)
        if (selectedCategory.toLowerCase() === "news") {
          matchesCategory = publishDate >= fortyEightHoursAgo;
        } else {
          // Normaliser les catégories
          const videoCategories = Array.isArray(video.categories) 
            ? video.categories.map(cat => typeof cat === 'string' ? cat.toLowerCase() : '')
            : [];

          // Si pas de catégories, analyser le contenu
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

            for (const [category, keywords] of Object.entries(categoryKeywords)) {
              if (keywords.some(keyword => content.includes(keyword))) {
                videoCategories.push(category);
                break;
              }
            }

            if (videoCategories.length === 0) {
              videoCategories.push("news");
            }
          }

          matchesCategory = videoCategories.includes(selectedCategory.toLowerCase());
        }
      }

      return matchesSearch && matchesCategory;
    });

    console.log("Filtered videos:", filteredVideos);

    // Tri
    const sortedVideos = [...filteredVideos].sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return (
            new Date(b.published_date).getTime() -
            new Date(a.published_date).getTime()
          );
        case "oldest":
          return (
            new Date(a.published_date).getTime() -
            new Date(b.published_date).getTime()
          );
        case "popular":
          const aViews = a.stats?.view_count || 0;
          const bViews = b.stats?.view_count || 0;
          return bViews - aViews;
        default:
          return 0;
      }
    });

    console.log("Sorted videos:", sortedVideos);
    return sortedVideos;
  }, [videos, searchTerm, selectedCategory, sortOption]);
}