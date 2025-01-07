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
      sortOption
    });

    if (!videos) return [];

    // Filtrage
    const filteredVideos = videos.filter((video) => {
      if (!video) return false;

      // Filtre de recherche
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || [
        video.title,
        video.summary,
        ...(video.categories || [])
      ].some(text => 
        text?.toLowerCase().includes(searchTermLower)
      );

      // Filtre de catégorie
      let matchesCategory = true;
      if (selectedCategory.toLowerCase() !== "all") {
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const publishDate = new Date(video.published_date);

        // Vérifier si c'est une news (moins de 48h)
        if (selectedCategory.toLowerCase() === "news") {
          matchesCategory = publishDate >= fortyEightHoursAgo || 
                          (video.categories && video.categories.includes('news'));
        } else {
          // Normaliser les catégories
          const videoCategories = Array.isArray(video.categories) 
            ? video.categories.map(cat => typeof cat === 'string' ? cat.toLowerCase() : '')
            : [];

          // Correspondances de catégories (français/anglais)
          const categoryMappings: Record<string, string[]> = {
            'politics': ['politics', 'politique'],
            'economy': ['economy', 'économie'],
            'science': ['science'],
            'technology': ['technology', 'technologie'],
            'culture': ['culture'],
            'entertainment': ['entertainment', 'divertissement', 'humour'],
            'humor': ['humor', 'humour', 'comedy', 'comédie'],
            'news': ['news', 'actualités']
          };

          const selectedCategoryLower = selectedCategory.toLowerCase();
          const matchingCategories = categoryMappings[selectedCategoryLower] || 
                                   [selectedCategoryLower];

          matchesCategory = videoCategories.some(cat =>
            matchingCategories.includes(cat)
          );
        }
      }

      return matchesSearch && matchesCategory;
    });

    console.log("Filtered videos count:", filteredVideos.length);

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

    console.log("Final sorted videos:", sortedVideos.length);
    return sortedVideos;
  }, [videos, searchTerm, selectedCategory, sortOption]);
}