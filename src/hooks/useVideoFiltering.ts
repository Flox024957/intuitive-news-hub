import { useMemo } from "react";
import { type Video } from "@/types/video";
import { type VideoCategory } from "@/types/category";
import { type SortOption } from "@/components/SortOptions";

interface VideoFilteringProps {
  videos: Video[];
  searchTerm: string;
  selectedCategory: VideoCategory;
  sortOption: SortOption;
}

function filterBySearch(video: Video, searchTerm: string): boolean {
  if (!searchTerm) return true;
  
  const searchTermLower = searchTerm.toLowerCase();
  const searchableContent = [
    video.title,
    video.summary,
    ...(Array.isArray(video.categories) ? video.categories : [])
  ].filter(Boolean);

  const matches = searchableContent.some(text => 
    text?.toLowerCase().includes(searchTermLower)
  );

  console.log("Search filtering:", {
    videoId: video.id,
    title: video.title,
    searchTerm,
    matches
  });

  return matches;
}

function filterByCategory(video: Video, selectedCategory: VideoCategory): boolean {
  if (selectedCategory === "all") return true;
  
  if (!Array.isArray(video.categories)) {
    console.log("Invalid categories:", {
      videoId: video.id,
      title: video.title,
      categories: video.categories
    });
    return false;
  }

  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const publishDate = new Date(video.published_date);

  // Pour la section News
  if (selectedCategory === "news") {
    const isRecent = publishDate >= fortyEightHoursAgo;
    const hasNewsTag = video.categories.includes("news");
    return isRecent || hasNewsTag;
  }

  const hasCategory = video.categories.includes(selectedCategory);
  console.log("Category filtering:", {
    videoId: video.id,
    title: video.title,
    categories: video.categories,
    selectedCategory,
    matches: hasCategory
  });

  return hasCategory;
}

function sortVideos(videos: Video[], sortOption: SortOption): Video[] {
  return [...videos].sort((a, b) => {
    switch (sortOption) {
      case "recent":
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
      case "oldest":
        return new Date(a.published_date).getTime() - new Date(b.published_date).getTime();
      case "popular":
        const aViews = a.stats?.view_count || 0;
        const bViews = b.stats?.view_count || 0;
        return bViews - aViews;
      default:
        return 0;
    }
  });
}

export function useVideoFiltering({
  videos,
  searchTerm,
  selectedCategory,
  sortOption,
}: VideoFilteringProps) {
  return useMemo(() => {
    if (!videos?.length) {
      console.log("No videos provided to useVideoFiltering");
      return [];
    }

    console.log("Starting video filtering:", {
      totalVideos: videos.length,
      searchTerm,
      selectedCategory,
      sortOption
    });

    const filteredVideos = videos.filter(video => 
      video && 
      filterBySearch(video, searchTerm) && 
      filterByCategory(video, selectedCategory)
    );

    console.log("Filtered videos count:", filteredVideos.length);

    const sortedVideos = sortVideos(filteredVideos, sortOption);
    console.log("Final sorted videos:", sortedVideos.length);

    return sortedVideos;
  }, [videos, searchTerm, selectedCategory, sortOption]);
}