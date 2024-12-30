import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { VideoGrid } from "@/components/VideoGrid";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Navigation } from "@/components/Navigation";
import { SearchBar } from "@/components/SearchBar";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  // Fetch videos with their podcaster information
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          podcaster:podcasters(*)
        `)
        .order("published_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get the most recent video for the featured section
  const featuredVideo = videos?.[0];

  return (
    <>
      <Navigation />
      <div className="min-h-screen container py-8 space-y-8 animate-fade-up mt-16">
        {featuredVideo && (
          <FeaturedVideo
            title={featuredVideo.custom_title || featuredVideo.title}
            summary={featuredVideo.summary || ""}
            thumbnail={featuredVideo.thumbnail_url || ""}
            category={featuredVideo.categories?.[0] || "Actualités"}
          />
        )}
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <h2 className="text-2xl font-bold">Dernières vidéos</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-64">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>
              <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          </div>

          <SortOptions selected={sortOption} onSelect={setSortOption} />
          
          <VideoGrid
            videos={videos}
            isLoading={isLoading}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            sortOption={sortOption}
          />
        </div>
      </div>
    </>
  );
};

export default Index;