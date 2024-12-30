import { Clock, Bookmark, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { type Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
  stats?: Database['public']['Tables']['video_stats']['Row'];
};

interface PersonalizedTabsProps {
  videos: Video[] | null;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

export function PersonalizedTabs({
  videos,
  isLoading,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortOption,
  setSortOption,
}: PersonalizedTabsProps) {
  const { data: trendingVideos, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['trendingVideos'],
    queryFn: async () => {
      const { data: videoStats } = await supabase
        .from('video_stats')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(20);

      if (!videoStats?.length) return [];

      const videoIds = videoStats.map(stat => stat.video_id);
      
      const { data: videos } = await supabase
        .from('videos')
        .select(`
          *,
          podcaster:podcasters(*)
        `)
        .in('id', videoIds);

      return videos?.map(video => ({
        ...video,
        stats: videoStats.find(stat => stat.video_id === video.id),
      })) || [];
    },
    enabled: true,
  });

  return (
    <Tabs defaultValue="recent" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
        <TabsTrigger value="recent" className="space-x-2">
          <Clock className="w-4 h-4" />
          <span>Récents</span>
        </TabsTrigger>
        <TabsTrigger value="favorites" className="space-x-2">
          <Bookmark className="w-4 h-4" />
          <span>Favoris</span>
        </TabsTrigger>
        <TabsTrigger value="trending" className="space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Tendances</span>
        </TabsTrigger>
      </TabsList>

      {['recent', 'favorites', 'trending'].map((tab) => (
        <TabsContent key={tab} value={tab} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">
              {tab === 'recent' ? 'Vidéos récentes' : 
               tab === 'favorites' ? 'Mes favoris' : 'Tendances'}
            </h2>
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
              <SortOptions
                selected={sortOption}
                onSelect={setSortOption}
              />
            </div>
          </div>
          
          <VideoGrid
            videos={tab === 'trending' ? trendingVideos : videos}
            isLoading={tab === 'trending' ? isTrendingLoading : isLoading}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            sortOption={sortOption}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}