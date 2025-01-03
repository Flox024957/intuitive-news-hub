import { VideoCard } from "@/components/VideoCard";
import { type Database } from "@/integrations/supabase/types";
import { type SortOption } from "@/components/SortOptions";
import { motion } from "framer-motion";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
  stats?: Database['public']['Tables']['video_stats']['Row'];
};

interface VideoGridProps {
  videos: Video[] | null;
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string;
  sortOption: SortOption;
}

export function VideoGrid({ videos, isLoading, searchTerm, selectedCategory, sortOption }: VideoGridProps) {
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

  const filteredVideos = videos?.filter(video => {
    const matchesSearch = searchTerm === '' || 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || 
      video.categories?.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const sortedVideos = [...(filteredVideos || [])].sort((a, b) => {
    switch (sortOption) {
      case "recent":
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
      case "oldest":
        return new Date(a.published_date).getTime() - new Date(b.published_date).getTime();
      case "popular":
        const aViews = a.stats?.view_count || 0;
        const bViews = b.stats?.view_count || 0;
        return bViews - aViews;
      default:
        return 0;
    }
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
    <div className="content-grid">
      {sortedVideos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
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
    </div>
  );
}