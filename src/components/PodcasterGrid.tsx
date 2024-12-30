import { PodcasterCard } from "@/components/PodcasterCard";
import { type Database } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Podcaster = Database['public']['Tables']['podcasters']['Row'];

export function PodcasterGrid() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!session?.user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      return profile;
    },
    enabled: !!session?.user,
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
      if (!session?.user) {
        navigate('/auth');
        throw new Error('Vous devez être connecté pour ajouter des favoris');
      }

      const currentFavorites = profile?.favorite_podcasters || [];
      const newFavorites = currentFavorites.includes(podcasterId)
        ? currentFavorites.filter(id => id !== podcasterId)
        : [...currentFavorites, podcasterId];

      const { error } = await supabase
        .from('profiles')
        .update({ favorite_podcasters: newFavorites })
        .eq('id', session.user.id);

      if (error) throw error;
      return newFavorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Favoris mis à jour avec succès');
    },
    onError: (error) => {
      if (error.message === 'Vous devez être connecté pour ajouter des favoris') {
        toast.error(error.message);
      } else {
        toast.error('Erreur lors de la mise à jour des favoris');
      }
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