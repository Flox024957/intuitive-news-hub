import { VideoCard } from "@/components/VideoCard";
import { type Database } from "@/integrations/supabase/types";
import { type SortOption } from "@/components/SortOptions";

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
          <div
            key={index}
            className="glass-card animate-pulse rounded-lg overflow-hidden"
          >
            <div className="aspect-video bg-secondary/50" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-secondary/50 rounded w-1/4" />
              <div className="h-6 bg-secondary/50 rounded w-3/4" />
              <div className="h-4 bg-secondary/50 rounded w-2/3" />
            </div>
          </div>
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
      <div className="text-center py-8 text-muted-foreground">
        Aucune vidéo ne correspond à votre recherche
      </div>
    );
  }

  return (
    <div className="content-grid">
      {sortedVideos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.custom_title || video.title}
          summary={video.summary || ""}
          thumbnail={video.thumbnail_url || ""}
          category={video.categories?.[0] || "Actualités"}
          date={new Date(video.published_date).toLocaleDateString()}
          viewCount={video.stats?.view_count}
        />
      ))}
    </div>
  );
}