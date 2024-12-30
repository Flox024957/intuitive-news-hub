import { VideoCard } from "@/components/VideoCard";
import { type Database } from "@/integrations/supabase/types";
import { type SortOption } from "@/components/SortOptions";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
};

interface VideoGridProps {
  videos: Video[] | null;
  isLoading: boolean;
  searchTerm: string;
  selectedCategory: string;
  sortOption: SortOption;
}

export function VideoGrid({ videos, isLoading, searchTerm, selectedCategory, sortOption }: VideoGridProps) {
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
        // Pour l'instant, on trie par date en attendant d'avoir une métrique de popularité
        return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

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