import { Button } from "@/components/ui/button";
import { Heart, HeartOff } from "lucide-react";
import { type Database } from "@/integrations/supabase/types";
import { useState } from "react";
import { toast } from "sonner";

type Podcaster = Database['public']['Tables']['podcasters']['Row'];

interface PodcasterCardProps {
  podcaster: Podcaster;
  isFavorite: boolean;
  onToggleFavorite: (podcasterId: string) => void;
}

export function PodcasterCard({ podcaster, isFavorite, onToggleFavorite }: PodcasterCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      setIsUpdating(true);
      await onToggleFavorite(podcaster.id);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris:", error);
      toast.error("Une erreur est survenue lors de la mise à jour des favoris");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="glass-card p-4 rounded-lg space-y-4">
      <div className="flex items-center space-x-4">
        {podcaster.profile_picture_url && (
          <img
            src={podcaster.profile_picture_url}
            alt={podcaster.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{podcaster.name}</h3>
          {podcaster.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {podcaster.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          disabled={isUpdating}
          className="relative"
        >
          {isFavorite ? (
            <Heart className="w-6 h-6 text-primary fill-primary" />
          ) : (
            <HeartOff className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
}