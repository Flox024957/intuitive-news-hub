import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { VideoGrid } from "@/components/VideoGrid";
import { type Video } from "@/types/video";

interface TrendingContentProps {
  videos: Video[];
  isLoading: boolean;
}

export function TrendingContent({ videos, isLoading }: TrendingContentProps) {
  return (
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
        videos={videos}
        isLoading={isLoading}
        searchTerm=""
        selectedCategory="all"
        sortOption="popular"
      />
    </motion.div>
  );
}