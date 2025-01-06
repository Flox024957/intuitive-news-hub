import { motion } from "framer-motion";
import { 
  Sparkles, 
  Grid, 
  BookOpen, 
  Film, 
  Globe, 
  LineChart, 
  Flask, 
  Cpu, 
  Palette, 
  Newspaper 
} from "lucide-react";
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

  const categories = [
    { id: "all", label: "Toutes les vidéos", icon: Grid },
    { id: "news", label: "News", icon: Newspaper },
    { id: "politics", label: "Politique", icon: Globe },
    { id: "economy", label: "Économie", icon: LineChart },
    { id: "science", label: "Science", icon: Flask },
    { id: "technology", label: "Technologie", icon: Cpu },
    { id: "culture", label: "Culture", icon: Palette },
    { id: "divertissement", label: "Divertissement", icon: Film },
    { id: "tutoriels", label: "Tutoriels", icon: BookOpen },
    { id: "reportages", label: "Reportages", icon: Film },
  ];

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
          <TabsList className="w-full max-w-6xl mx-auto glass-card p-1 grid grid-cols-2 md:grid-cols-5 gap-1">
            {categories.map(({ id, label, icon: Icon }) => (
              <TabsTrigger 
                key={id}
                value={id} 
                className="flex items-center justify-center gap-2 py-3"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(({ id, label }) => (
            <TabsContent key={id} value={id} className="space-y-6 animate-fade-up">
              <VideoGrid
                videos={id === "all" ? videos : filterVideosByCategory(label)}
                isLoading={isLoading}
                searchTerm={searchTerm}
                selectedCategory={id === "all" ? selectedCategory : label}
                sortOption={sortOption}
              />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}