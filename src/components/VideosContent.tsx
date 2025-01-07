import { motion } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { VideosHeader } from "@/components/VideosHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { categories } from "@/constants/categories";

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
  const filterVideosByCategory = (category: string) => {
    return videos.filter(video => {
      if (category === "all") return true;
      if (!video.categories) return false;
      
      const normalizedCategories = video.categories.map((cat: string) => cat.toLowerCase());
      const normalizedCategory = category.toLowerCase();
      
      return normalizedCategories.includes(normalizedCategory);
    });
  };

  return (
    <div className="space-y-36">
      <VideosHeader 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        sortOption={sortOption}
        onSortChange={onSortChange}
      />

      <Tabs defaultValue="all" className="w-full space-y-36">
        <CategoryTabs 
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
        />

        {categories.map(({ id }) => (
          <TabsContent 
            key={id} 
            value={id} 
            className="mt-36 space-y-24"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VideoGrid
                videos={filterVideosByCategory(id)}
                isLoading={isLoading}
                searchTerm={searchTerm}
                selectedCategory={id}
                sortOption={sortOption}
              />
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}