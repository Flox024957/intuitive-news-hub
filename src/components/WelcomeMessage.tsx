import { PodcasterFavorites } from "@/components/PodcasterFavorites";
import { type Database } from "@/integrations/supabase/types";

type Podcaster = Database['public']['Tables']['podcasters']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface WelcomeMessageProps {
  allPodcasters: Podcaster[] | null;
  profile: Profile | null;
}

export function WelcomeMessage({ allPodcasters, profile }: WelcomeMessageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold text-gradient">Ma page personnalisée</h1>
      <p className="text-muted-foreground">
        Commencez par ajouter des podcasters en favoris pour personnaliser votre flux
      </p>
      <PodcasterFavorites
        allPodcasters={allPodcasters}
        favoritePodcasters={profile?.favorite_podcasters}
        onToggleFavorite={() => {}}
        isUpdating={false}
      />
    </div>
  );
}