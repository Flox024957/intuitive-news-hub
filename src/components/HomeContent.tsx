import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Users, TrendingUp, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { PodcasterGrid } from "@/components/PodcasterGrid";

interface HomeContentProps {
  videos: any[];
  isLoading: boolean;
  trendingVideos: any[];
}

export function HomeContent({ videos, isLoading, trendingVideos }: HomeContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  return (
    <div className="container py-8 mt-16 space-y-8"> {/* Added mt-16 for navbar spacing */}
      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList className="w-full max-w-md mx-auto glass-card">
          <TabsTrigger value="videos" className="flex items-center gap-2 flex-1">
            <Play className="w-4 h-4" />
            <span>Vidéos</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2 flex-1">
            <TrendingUp className="w-4 h-4" />
            <span>Tendances</span>
          </TabsTrigger>
          <TabsTrigger value="podcasters" className="flex items-center gap-2 flex-1">
            <Users className="w-4 h-4" />
            <span>Podcasters</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          <motion.div 
            className="flex flex-col md:flex-row gap-4 md:items-center justify-between glass-card p-6 rounded-lg"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <h2 className="text-2xl font-bold">Dernières vidéos</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-64">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>
              <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 rounded-lg"
          >
            <SortOptions selected={sortOption} onSelect={setSortOption} />
          </motion.div>
          
          <VideoGrid
            videos={videos}
            isLoading={isLoading}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            sortOption={sortOption}
          />
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 glass-card p-6 rounded-lg"
          >
            <TrendingUp className="w-6 h-6 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold">Vidéos tendances</h2>
          </motion.div>
          <VideoGrid
            videos={trendingVideos}
            isLoading={isLoading}
            searchTerm=""
            selectedCategory="All"
            sortOption="popular"
          />
        </TabsContent>

        <TabsContent value="podcasters" className="space-y-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 glass-card p-6 rounded-lg">
              <Users className="w-6 h-6 text-primary animate-pulse" />
              <h2 className="text-2xl font-bold">Nos podcasters</h2>
            </div>
            <PodcasterGrid />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}