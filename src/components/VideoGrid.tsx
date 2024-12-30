import { VideoCard } from "@/components/VideoCard";
import { type Database } from "@/integrations/supabase/types";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
};

interface VideoGridProps {
  videos: Video[] | null;
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string;
}

export function VideoGrid({ videos, isLoading, searchTerm, selectedCategory }: VideoGridProps) {
  const filteredVideos = videos?.filter(video => {
    const matchesSearch = searchTerm === '' || 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || 
      video.categories?.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!filteredVideos?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune vidéo ne correspond à votre recherche
      </div>
    );
  }

  return (
    <div className="content-grid">
      {filteredVideos.map((video) => (
        <VideoCard
          key={video.id}
          title={video.custom_title || video.title}
          summary={video.summary || ""}
          thumbnail={video.thumbnail_url || ""}
          category={video.categories?.[0] || "Actualités"}
          date={new Date(video.published_date).toLocaleDateString()}
        />
      ))}
    </div>
  );
}