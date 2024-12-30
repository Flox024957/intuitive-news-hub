import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { FeaturedVideo } from "@/components/FeaturedVideo";
import { VideoCard } from "@/components/VideoCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Bookmark, Clock, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PersonalizedHome = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch user's profile and favorite podcasters
  const { data: profile } = useQuery({
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

  // Fetch videos from favorite podcasters
  const { data: videos, isLoading } = useQuery({
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

  return (
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
                <div className="text-center py-8">Chargement...</div>
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
                  Aucune vidéo disponible pour le moment
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default PersonalizedHome;