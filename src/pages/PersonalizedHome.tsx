import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { VideoCard } from "@/components/VideoCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Bookmark, Clock, TrendingUp, Heart, HeartOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";

const PersonalizedHomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const queryClient = useQueryClient();

  // Fetch user's profile and favorite podcasters
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

  // Fetch all available podcasters
  const { data: allPodcasters } = useQuery({
    queryKey: ['podcasters'],
    queryFn: async () => {
      const { data: podcasters } = await supabase
        .from('podcasters')
        .select('*');
      return podcasters;
    },
  });

  // Mutation to update favorite podcasters
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

  // Toggle favorite status for a podcaster
  const toggleFavorite = (podcasterId: string) => {
    if (!profile) return;

    const currentFavorites = profile.favorite_podcasters || [];
    const newFavorites = currentFavorites.includes(podcasterId)
      ? currentFavorites.filter(id => id !== podcasterId)
      : [...currentFavorites, podcasterId];

    updateFavoritesMutation.mutate(newFavorites);
  };

  // Fetch videos from favorite podcasters
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

  // Featured video is the most recent video
  const featuredVideo = videos?.[0] ? {
    title: videos[0].custom_title || videos[0].title,
    summary: videos[0].summary || "",
    thumbnail: videos[0].thumbnail_url || "",
    category: videos[0].categories?.[0] || "Actualités",
  } : null;

  const filteredVideos = videos?.filter(video => 
    selectedCategory === "All" || video.categories?.includes(selectedCategory)
  );

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

          {/* Podcasters Management Section */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Gérer mes podcasters favoris</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allPodcasters?.map((podcaster) => (
                <div key={podcaster.id} className="flex items-center justify-between p-3 glass-card rounded-lg">
                  <div className="flex items-center space-x-3">
                    {podcaster.profile_picture_url && (
                      <img 
                        src={podcaster.profile_picture_url} 
                        alt={podcaster.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium">{podcaster.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(podcaster.id)}
                    disabled={updateFavoritesMutation.isPending}
                  >
                    {profile?.favorite_podcasters?.includes(podcaster.id) ? (
                      <Heart className="w-5 h-5 text-primary fill-primary" />
                    ) : (
                      <HeartOff className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

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
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {tab === 'recent' ? 'Vidéos récentes' : 
                     tab === 'favorites' ? 'Mes favoris' : 'Tendances'}
                  </h2>
                  <CategoryFilter
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : filteredVideos?.length ? (
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {profile?.favorite_podcasters?.length 
                      ? "Aucune vidéo disponible pour le moment"
                      : "Ajoutez des podcasters en favoris pour voir leurs vidéos ici"}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default PersonalizedHomePage;