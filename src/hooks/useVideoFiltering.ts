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
        const normalizedCategories = video.categories?.map((cat) =>
          cat.toLowerCase()
        ) || [];
        
        // Si pas de catégories, mettre par défaut dans "news"
        if (normalizedCategories.length === 0) {
          normalizedCategories.push("news");
        }
        
        matchesCategory = normalizedCategories.includes(selectedCategory.toLowerCase());
        
        console.log("Category matching for video:", {
          title: video.title,
          videoCategories: normalizedCategories,
          selectedCategory: selectedCategory.toLowerCase(),
          matches: matchesCategory
        });
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