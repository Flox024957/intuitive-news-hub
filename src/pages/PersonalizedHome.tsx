import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Bookmark, Clock, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PodcasterFavorites } from "@/components/PodcasterFavorites";
import { SearchBar } from "@/components/SearchBar";
import { VideoGrid } from "@/components/VideoGrid";

const PersonalizedHomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

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

  const updateFavoritesMutation = useMutation({
    mutationFn: async (newFavorites: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('profiles')
        .update({ favorite_podcasters: newFavorites })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Favoris mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des favoris');
    },
  });

  const toggleFavorite = (podcasterId: string) => {
    if (!profile) return;

    const currentFavorites = profile.favorite_podcasters || [];
    const newFavorites = currentFavorites.includes(podcasterId)
      ? currentFavorites.filter(id => id !== podcasterId)
      : [...currentFavorites, podcasterId];

    updateFavoritesMutation.mutate(newFavorites);
  };

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
        .order('published_date', { ascending: false })
        .limit(20);

      if (error) {
        toast.error("Erreur lors du chargement des vidéos");
        throw error;
      }

      return videos;
    },
    enabled: !!profile?.favorite_podcasters?.length,
  });

  const featuredVideo = videos?.[0] ? {
    title: videos[0].custom_title || videos[0].title,
    summary: videos[0].summary || "",
    thumbnail: videos[0].thumbnail_url || "",
    category: videos[0].categories?.[0] || "Actualités",
  } : null;

  const isLoading = isProfileLoading || isVideosLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container py-20 space-y-8 animate-fade-up">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gradient">Ma page personnalisée</h1>
            <p className="text-muted-foreground">
              {profile?.favorite_podcasters?.length 
                ? "Retrouvez ici les dernières vidéos de vos podcasters favoris"
                : "Ajoutez des podcasters en favoris pour personnaliser votre flux"}
            </p>
          </div>

          <PodcasterFavorites
            allPodcasters={allPodcasters}
            favoritePodcasters={profile?.favorite_podcasters}
            onToggleFavorite={toggleFavorite}
            isUpdating={updateFavoritesMutation.isPending}
          />

          {featuredVideo && <FeaturedVideo {...featuredVideo} />}
          
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
                  </div>
                </div>
                
                <VideoGrid
                  videos={videos}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
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