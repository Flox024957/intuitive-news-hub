import { motion } from "framer-motion";
import { type Video, type NormalizedVideo } from "@/types/video";
import { HomeTabs } from "@/components/HomeTabs";
import { VideosContent } from "@/components/VideosContent";
import { TrendingContent } from "@/components/TrendingContent";
import { PodcastersContent } from "@/components/PodcastersContent";
import { useYouTubeChannelsVideos } from "@/components/YouTubeVideoManager";
import { useNormalizedVideos } from "@/hooks/useNormalizedVideos";
import { useVideoState } from "@/hooks/useVideoState";

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
  const {
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption
  } = useVideoState();

  const { videos: youtubeVideos, isLoading: isLoadingYoutube } = useYouTubeChannelsVideos();
  const allVideos = useNormalizedVideos(videos, youtubeVideos);

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
            trending: <TrendingContent videos={trendingVideos} isLoading={isLoadingDb} />,
            podcasters: <PodcastersContent />
          }}
        </HomeTabs>
      </div>
    </div>
  );
}