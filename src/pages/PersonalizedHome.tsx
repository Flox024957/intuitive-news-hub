import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { type SortOption } from "@/components/SortOptions";
import { PersonalizedHeader } from "@/components/PersonalizedHeader";
import { PersonalizedTabs } from "@/components/PersonalizedTabs";
import { WelcomeMessage } from "@/components/WelcomeMessage";

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

  const isLoading = isProfileLoading || isVideosLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-20 space-y-8 animate-fade-up">
          {!profile?.favorite_podcasters?.length ? (
            <WelcomeMessage
              allPodcasters={allPodcasters}
              profile={profile}
            />
          ) : (
            <>
              <PersonalizedHeader featuredVideo={videos?.[0]} />
              <PersonalizedTabs
                videos={videos}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default PersonalizedHomePage;