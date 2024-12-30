import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { VideoGrid } from "@/components/VideoGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { PodcasterGrid } from "@/components/PodcasterGrid";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Users, TrendingUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data: videoStats } = await supabase
        .from("video_stats")
        .select("*")
        .order("view_count", { ascending: false })
        .limit(20);

      if (!videoStats?.length) return [];

      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          podcaster:podcasters(*)
        `)
        .order("published_date", { ascending: false });

      if (error) throw error;

      return data?.map(video => ({
        ...video,
        stats: videoStats.find(stat => stat.video_id === video.id)
      }));
    },
  });

  const featuredVideo = videos?.[0];
  const trendingVideos = videos?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen container py-8 space-y-8 mt-16"
        >
          {featuredVideo && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative"
            >
              <FeaturedVideo
                title={featuredVideo.custom_title || featuredVideo.title}
                summary={featuredVideo.summary || ""}
                thumbnail={featuredVideo.thumbnail_url || ""}
                category={featuredVideo.categories?.[0] || "Actualités"}
              />
            </motion.div>
          )}
          
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
                className="flex flex-col md:flex-row gap-4 md:items-center justify-between"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
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
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-6 h-6 text-primary" />
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

            <TabsContent value="podcasters">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Nos podcasters</h2>
                </div>
                <PodcasterGrid />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;