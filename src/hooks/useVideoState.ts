import { useState } from "react";
import { type VideoCategory } from "@/types/category";
import { type SortOption } from "@/components/SortOptions";

export function useVideoState() {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  return {
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption
  };
}