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

export function HomeContent({
  videos,
  isLoading: isLoadingDb,
  trendingVideos,
}: HomeContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const { videos: youtubeVideos, isLoading: isLoadingYoutube } =
    useYouTubeVideos();

  // Normaliser les vidéos YouTube
  const normalizedYoutubeVideos = youtubeVideos.map((video) => ({
    id: video.id,
    youtube_video_id: video.id,
    title: video.title,
    summary: video.summary,
    thumbnail_url: video.thumbnail_url,
    published_date: video.published_date,
    categories: video.categories?.map((cat: string) => cat.toLowerCase()) || [],
    stats: {
      view_count: parseInt(video.statistics?.viewCount || "0", 10),
    },
  }));

  console.log("Videos from DB:", videos);
  console.log("Videos from YouTube:", normalizedYoutubeVideos);

  // Combiner et normaliser toutes les vidéos
  const allVideos = [
    ...(videos?.map((video) => ({
      ...video,
      categories: video.categories?.map((cat: string) => cat.toLowerCase()) || [],
    })) || []),
    ...normalizedYoutubeVideos,
  ];

  console.log("Combined videos:", allVideos);

  // Trier les vidéos par nombre de vues pour la section Tendances
  const sortedTrendingVideos = [...trendingVideos].sort((a, b) => {
    const aViews = a.stats?.view_count || 0;
    const bViews = b.stats?.view_count || 0;
    return bViews - aViews;
  });

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
        videos={sortedTrendingVideos}
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