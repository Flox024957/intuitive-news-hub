import { PodcasterCard } from "@/components/PodcasterCard";
import { type Database } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Podcaster = Database['public']['Tables']['podcasters']['Row'];

export function PodcasterGrid() {
  const queryClient = useQueryClient();

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

  const { data: podcasters, isLoading } = useQuery({
    queryKey: ['podcasters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcasters')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const updateFavoritesMutation = useMutation({
    mutationFn: async (podcasterId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const currentFavorites = profile?.favorite_podcasters || [];
      const newFavorites = currentFavorites.includes(podcasterId)
        ? currentFavorites.filter(id => id !== podcasterId)
        : [...currentFavorites, podcasterId];

      const { error } = await supabase
        .from('profiles')
        .update({ favorite_podcasters: newFavorites })
        .eq('id', user.id);

      if (error) throw error;
      return newFavorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Favoris mis à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des favoris');
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="glass-card p-4 rounded-lg animate-pulse space-y-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-secondary/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary/50 rounded w-3/4" />
                <div className="h-3 bg-secondary/50 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {podcasters?.map((podcaster) => (
        <PodcasterCard
          key={podcaster.id}
          podcaster={podcaster}
          isFavorite={profile?.favorite_podcasters?.includes(podcaster.id) || false}
          onToggleFavorite={() => updateFavoritesMutation.mutate(podcaster.id)}
        />
      ))}
    </div>
  );
}