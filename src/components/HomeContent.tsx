import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";
import { type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { PodcasterGrid } from "@/components/PodcasterGrid";
import { HomeTabs } from "@/components/HomeTabs";
import { VideosContent } from "@/components/VideosContent";
import { useYouTubeChannelsVideos } from "@/components/YouTubeVideoManager";
import { useNormalizedVideos } from "@/hooks/useNormalizedVideos";
import { type Video } from "@/types/video";

interface HomeContentProps {
  videos: Video[];
  isLoading: boolean;
  trendingVideos: Video[];
}

export function HomeContent({
  videos,
  isLoading: isLoadingDb,
  trendingVideos,
}: HomeContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const { videos: youtubeVideos, isLoading: isLoadingYoutube } = useYouTubeChannelsVideos();
  const allVideos = useNormalizedVideos(videos, youtubeVideos);

  const TrendingContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 px-6"
    >
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center gap-3 glass-card p-6 rounded-xl"
      >
        <TrendingUp className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gradient">Vidéos tendances</h2>
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
      className="space-y-8 px-6"
    >
      <div className="flex items-center gap-3 glass-card p-6 rounded-xl">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gradient">Nos podcasters</h2>
      </div>
      <PodcasterGrid />
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-16">
      <div className="container max-w-6xl mx-auto space-y-16">
        <HomeTabs>
          {{
            videos: (
              <div className="space-y-12 px-6">
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
            podcasters: PodcastersContent,
          }}
        </HomeTabs>
      </div>
    </div>
  );
}