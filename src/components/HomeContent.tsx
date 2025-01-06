import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { PodcasterGrid } from "@/components/PodcasterGrid";
import { HomeTabs } from "@/components/HomeTabs";
import { useYoutubeVideos } from "@/hooks/useYoutubeVideos";

interface HomeContentProps {
  videos: any[];
  isLoading: boolean;
  trendingVideos: any[];
}

export function HomeContent({ videos, isLoading, trendingVideos }: HomeContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const { data: idrissVideos, isLoading: isLoadingIdriss } = useYoutubeVideos('IdrissJAberkane');
  const { data: sanspermissionVideos, isLoading: isLoadingSansPermission } = useYoutubeVideos('sanspermissionpodcast');

  // Transform videos to add specific tags
  const transformedIdrissVideos = idrissVideos?.map(video => ({
    ...video,
    categories: ["News", "Politics", "Science", "Technology", "Economy", "Culture"]
  })) || [];

  const transformedSanspermissionVideos = sanspermissionVideos?.map(video => ({
    ...video,
    categories: ["Economy"]
  })) || [];

  const allVideos = [
    ...(videos || []), 
    ...transformedIdrissVideos,
    ...transformedSanspermissionVideos
  ];

  const VideosContent = (
    <>
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
        videos={allVideos}
        isLoading={isLoading || isLoadingIdriss || isLoadingSansPermission}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        sortOption={sortOption}
      />
    </>
  );

  const TrendingContent = (
    <>
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
    </>
  );

  const PodcastersContent = (
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
  );

  return (
    <div className="container py-8 mt-16 space-y-8">
      <HomeTabs>
        {{
          videos: VideosContent,
          trending: TrendingContent,
          podcasters: PodcastersContent
        }}
      </HomeTabs>
    </div>
  );
}
