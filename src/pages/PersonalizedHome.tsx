import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortOptions, type SortOption } from "@/components/SortOptions";
import { Bookmark, Clock, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PodcasterFavorites } from "@/components/PodcasterFavorites";
import { SearchBar } from "@/components/SearchBar";
import { VideoGrid } from "@/components/VideoGrid";

const PersonalizedHomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return profile;
    },
  });

  const { data: allPodcasters } = useQuery({
    queryKey: ['podcasters'],
    queryFn: async () => {
      const { data: podcasters } = await supabase
        .from('podcasters')
        .select('*');
      return podcasters;
    },
  });

  const { data: videos, isLoading: isVideosLoading } = useQuery({
    queryKey: ['personalizedVideos', profile?.favorite_podcasters],
    queryFn: async () => {
      if (!profile?.favorite_podcasters?.length) {
        return [];
      }

      const { data: videos, error } = await supabase
        .from('videos')
        .select(`
          *,
          podcaster:podcasters(*)
        `)
        .in('podcaster_id', profile.favorite_podcasters)
        .order('published_date', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des vidéos");
        throw error;
      }

      return videos;
    },
    enabled: !!profile?.favorite_podcasters?.length,
  });

  const featuredVideo = videos?.[0];

  const isLoading = isProfileLoading || isVideosLoading;

  if (!profile?.favorite_podcasters?.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container py-20 space-y-8 animate-fade-up">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gradient">Ma page personnalisée</h1>
              <p className="text-muted-foreground">
                Commencez par ajouter des podcasters en favoris pour personnaliser votre flux
              </p>
            </div>
            <PodcasterFavorites
              allPodcasters={allPodcasters}
              favoritePodcasters={profile?.favorite_podcasters}
              onToggleFavorite={() => {}}
              isUpdating={false}
            />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-20 space-y-8 animate-fade-up">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gradient">Ma page personnalisée</h1>
            <p className="text-muted-foreground">
              Retrouvez ici les dernières vidéos de vos podcasters favoris
            </p>
          </div>

          {featuredVideo && (
            <FeaturedVideo
              title={featuredVideo.custom_title || featuredVideo.title}
              summary={featuredVideo.summary || ""}
              thumbnail={featuredVideo.thumbnail_url || ""}
              category={featuredVideo.categories?.[0] || "Actualités"}
            />
          )}
          
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
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default PersonalizedHomePage;