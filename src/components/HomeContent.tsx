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
      className="space-y-8 px-4 py-8"
    >
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center gap-3 glass-card p-6 rounded-xl"
      >
        <TrendingUp className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-gradient">
          Vidéos tendances
        </h2>
      </motion.div>
      <div className="mt-8">
        <VideoGrid
          videos={trendingVideos}
          isLoading={isLoadingDb}
          searchTerm=""
          selectedCategory="All"
          sortOption="popular"
        />
      </div>
    </motion.div>
  );

  const PodcastersContent = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 px-4 py-8"
    >
      <div className="flex items-center gap-3 glass-card p-6 rounded-xl">
        <Users className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-gradient">
          Nos podcasters
        </h2>
      </div>
      <div className="mt-8">
        <PodcasterGrid />
      </div>
    </motion.div>
  );

  return (
    <div className="container max-w-7xl mx-auto py-12 space-y-12">
      <HomeTabs>
        {{
          videos: (
            <div className="px-4">
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
  );
}