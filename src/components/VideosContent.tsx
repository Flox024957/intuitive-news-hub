import { motion } from "framer-motion";
import { Sparkles, Grid, BookOpen, Film } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    return videos.filter(video => 
      video.categories?.includes(category) || 
      (category === "All" && video.categories)
    );
  };

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex flex-col gap-6 glass-card p-8 rounded-xl shadow-lg"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
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
            <SortOptions selected={sortOption} onSelect={onSortChange} />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full space-y-6">
          <TabsList className="w-full max-w-4xl mx-auto glass-card p-1">
            <TabsTrigger value="all" className="flex-1 py-3 flex items-center justify-center gap-2">
              <Grid className="w-4 h-4" />
              Toutes les vidéos
            </TabsTrigger>
            <TabsTrigger value="divertissement" className="flex-1 py-3 flex items-center justify-center gap-2">
              <Film className="w-4 h-4" />
              Divertissement
            </TabsTrigger>
            <TabsTrigger value="tutoriels" className="flex-1 py-3 flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              Tutoriels
            </TabsTrigger>
            <TabsTrigger value="reportages" className="flex-1 py-3 flex items-center justify-center gap-2">
              <Film className="w-4 h-4" />
              Reportages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 animate-fade-up">
            <VideoGrid
              videos={videos}
              isLoading={isLoading}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              sortOption={sortOption}
            />
          </TabsContent>

          <TabsContent value="divertissement" className="space-y-6 animate-fade-up">
            <VideoGrid
              videos={filterVideosByCategory("Divertissement")}
              isLoading={isLoading}
              searchTerm={searchTerm}
              selectedCategory="Divertissement"
              sortOption={sortOption}
            />
          </TabsContent>

          <TabsContent value="tutoriels" className="space-y-6 animate-fade-up">
            <VideoGrid
              videos={filterVideosByCategory("Tutoriels")}
              isLoading={isLoading}
              searchTerm={searchTerm}
              selectedCategory="Tutoriels"
              sortOption={sortOption}
            />
          </TabsContent>

          <TabsContent value="reportages" className="space-y-6 animate-fade-up">
            <VideoGrid
              videos={filterVideosByCategory("Reportages")}
              isLoading={isLoading}
              searchTerm={searchTerm}
              selectedCategory="Reportages"
              sortOption={sortOption}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}