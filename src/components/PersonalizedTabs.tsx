import { Clock, Bookmark, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { type Database } from "@/integrations/supabase/types";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
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
            videos={videos}
            isLoading={isLoading}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            sortOption={sortOption}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}