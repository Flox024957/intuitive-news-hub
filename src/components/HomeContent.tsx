import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";
import { type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { PodcasterGrid } from "@/components/PodcasterGrid";
import { HomeTabs } from "@/components/HomeTabs";
import { VideosContent } from "@/components/VideosContent";
import { useYouTubeVideos } from "@/components/YouTubeVideoManager";

interface HomeContentProps {
  videos: any[];
  isLoading: boolean;
  trendingVideos: any[];
}

export function HomeContent({ videos, isLoading: isLoadingDb, trendingVideos }: HomeContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const { videos: youtubeVideos, isLoading: isLoadingYoutube } = useYouTubeVideos();
  const allVideos = [...(videos || []), ...youtubeVideos];

  const TrendingContent = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 px-4"
    >
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center gap-3 glass-card p-8 rounded-xl"
      >
        <TrendingUp className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-gradient">
          Vidéos tendances
        </h2>
      </motion.div>
      <VideoGrid
        videos={trendingVideos}
        isLoading={isLoadingDb}
        searchTerm=""
        selectedCategory="All"
        sortOption="popular"
      />
    </motion.div>
  );

  const PodcastersContent = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 px-4"
    >
      <div className="flex items-center gap-3 glass-card p-8 rounded-xl">
        <Users className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-gradient">
          Nos podcasters
        </h2>
      </div>
      <PodcasterGrid />
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="container max-w-7xl mx-auto space-y-24">
        <HomeTabs>
          {{
            videos: (
              <div className="space-y-16 px-4">
                <VideosContent
                  videos={allVideos}
                  isLoading={isLoadingDb || isLoadingYoutube}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                />
              </div>
            ),
            trending: TrendingContent,
            podcasters: PodcastersContent
          }}
        </HomeTabs>
      </div>
    </div>
  );
}