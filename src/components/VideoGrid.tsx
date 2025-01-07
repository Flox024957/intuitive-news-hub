import { VideoCard } from "@/components/VideoCard";
import { type SortOption } from "@/components/SortOptions";
import { motion } from "framer-motion";
import { useVideoFiltering } from "@/hooks/useVideoFiltering";
import { useVideoCategories } from "@/hooks/useVideoCategories";
import { type Video } from "@/types/video";
import { Loader2 } from "lucide-react";

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
  // Filtrer d'abord par catégorie
  const categorizedVideos = useVideoCategories(videos, selectedCategory);
  
  // Ensuite appliquer les autres filtres (recherche et tri)
  const filteredVideos = useVideoFiltering({
    videos: categorizedVideos,
    searchTerm,
    selectedCategory,
    sortOption,
  });

  console.log("VideoGrid rendering with:", {
    totalVideos: videos?.length,
    categorizedCount: categorizedVideos?.length,
    filteredCount: filteredVideos?.length,
    selectedCategory,
    searchTerm,
    sortOption
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Chargement des vidéos...</p>
        </motion.div>
      </div>
    );
  }

  if (!filteredVideos?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[50vh] flex items-center justify-center"
      >
        <div className="text-center space-y-4">
          <p className="text-xl font-medium text-muted-foreground">
            Aucune vidéo ne correspond à votre recherche
          </p>
          <p className="text-sm text-muted-foreground">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {filteredVideos.map((video) => (
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
            date={new Date(video.published_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
            viewCount={video.stats?.view_count}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}