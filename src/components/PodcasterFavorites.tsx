import { Button } from "@/components/ui/button";
import { Heart, HeartOff } from "lucide-react";
import { type Database } from "@/integrations/supabase/types";

type Podcaster = Database['public']['Tables']['podcasters']['Row'];

interface PodcasterFavoritesProps {
  allPodcasters: Podcaster[] | null;
  favoritePodcasters: string[] | null;
  onToggleFavorite: (podcasterId: string) => void;
  isUpdating: boolean;
}

export function PodcasterFavorites({
  allPodcasters,
  favoritePodcasters,
  onToggleFavorite,
  isUpdating
}: PodcasterFavoritesProps) {
  return (
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
              onClick={() => onToggleFavorite(podcaster.id)}
              disabled={isUpdating}
            >
              {favoritePodcasters?.includes(podcaster.id) ? (
                <Heart className="w-5 h-5 text-primary fill-primary" />
              ) : (
                <HeartOff className="w-5 h-5" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}