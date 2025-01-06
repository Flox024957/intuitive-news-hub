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
        isLoading={isLoadingDb}
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
          videos: (
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
          ),
          trending: TrendingContent,
          podcasters: PodcastersContent
        }}
      </HomeTabs>
    </div>
  );
}