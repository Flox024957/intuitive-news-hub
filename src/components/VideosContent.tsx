import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";

interface VideosContentProps {
  videos: any[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function VideosContent({
  videos,
  isLoading,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  sortOption,
  onSortChange
}: VideosContentProps) {
  return (
    <div className="space-y-8">
      <motion.div 
        className="flex flex-col gap-6 glass-card p-8 rounded-xl shadow-lg"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Dernières vidéos
          </h2>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <div className="flex-1 min-w-[280px]">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
            />
          </div>
          <div className="flex-[2]">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={onCategorySelect}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 rounded-xl shadow-lg"
      >
        <SortOptions selected={sortOption} onSelect={onSortChange} />
      </motion.div>
      
      <VideoGrid
        videos={videos}
        isLoading={isLoading}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        sortOption={sortOption}
      />
    </div>
  );
}