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
  return [
    video.title,
    video.summary,
    ...(video.categories || [])
  ].some(text => text?.toLowerCase().includes(searchTermLower));
}

function filterByCategory(video: Video, selectedCategory: VideoCategory): boolean {
  if (selectedCategory.toLowerCase() === "all") return true;

  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const publishDate = new Date(video.published_date);

  if (selectedCategory === "news") {
    return publishDate >= fortyEightHoursAgo;
  }

  return video.categories?.some(cat => cat === selectedCategory) || false;
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
    console.log("Starting video filtering with:", {
      totalVideos: videos?.length,
      searchTerm,
      selectedCategory,
      sortOption
    });

    if (!videos) return [];

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