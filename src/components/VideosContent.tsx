import { motion } from "framer-motion";
import { 
  Sparkles, 
  Grid, 
  BookOpen, 
  Film, 
  Globe, 
  LineChart, 
  Microscope, 
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
    { id: "all", label: "Toutes les vidéos", icon: Grid, color: "text-blue-500" },
    { id: "news", label: "News", icon: Newspaper, color: "text-red-500" },
    { id: "politics", label: "Politique", icon: Globe, color: "text-green-500" },
    { id: "economy", label: "Économie", icon: LineChart, color: "text-yellow-500" },
    { id: "science", label: "Science", icon: Microscope, color: "text-purple-500" },
    { id: "technology", label: "Technologie", icon: Cpu, color: "text-cyan-500" },
    { id: "culture", label: "Culture", icon: Palette, color: "text-pink-500" },
    { id: "divertissement", label: "Divertissement", icon: Film, color: "text-orange-500" },
    { id: "tutoriels", label: "Tutoriels", icon: BookOpen, color: "text-indigo-500" },
    { id: "reportages", label: "Reportages", icon: Film, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-36">
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

        <Tabs defaultValue="all" className="w-full space-y-36">
          <TabsList className="w-full max-w-7xl mx-auto glass-card p-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4 place-items-center">
            {categories.map(({ id, label, icon: Icon, color }) => (
              <TabsTrigger 
                key={id}
                value={id} 
                className="group relative flex flex-col items-center justify-center gap-3 py-4 px-3 transition-all duration-300 hover:bg-white/5"
              >
                <Icon className={`w-6 h-6 ${color} transition-transform group-hover:scale-110`} />
                <span className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                  {label}
                </span>
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: id === selectedCategory ? "100%" : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(({ id, label }) => (
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
                  videos={id === "all" ? videos : filterVideosByCategory(label)}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                  selectedCategory={id === "all" ? selectedCategory : label}
                  sortOption={sortOption}
                />
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
}