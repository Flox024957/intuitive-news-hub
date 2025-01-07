import { VideoCard } from "@/components/VideoCard";
import { type SortOption } from "@/components/SortOptions";
import { motion } from "framer-motion";
import { useVideoFiltering } from "@/hooks/useVideoFiltering";
import { type Video } from "@/types/video";

interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string;
  sortOption: SortOption;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function VideoGrid({
  videos,
  isLoading,
  searchTerm,
  selectedCategory,
  sortOption,
}: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="content-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="glass-card animate-pulse rounded-lg overflow-hidden"
          >
            <div className="aspect-video bg-secondary/50" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-secondary/50 rounded w-1/4" />
              <div className="h-6 bg-secondary/50 rounded w-3/4" />
              <div className="h-4 bg-secondary/50 rounded w-2/3" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  const sortedVideos = useVideoFiltering({
    videos,
    searchTerm,
    selectedCategory,
    sortOption,
  });

  if (!sortedVideos?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 text-muted-foreground"
      >
        Aucune vidéo ne correspond à votre recherche
      </motion.div>
    );
  }

  return (
    <motion.div
      className="content-grid"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {sortedVideos.map((video) => (
        <motion.div
          key={video.id}
          variants={item}
          className="transform-gpu"
        >
          <VideoCard
            id={video.id}
            title={video.custom_title || video.title}
            summary={video.summary || ""}
            thumbnail={video.thumbnail_url || ""}
            category={video.categories?.[0] || "Actualités"}
            date={new Date(video.published_date).toLocaleDateString()}
            viewCount={video.stats?.view_count}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}