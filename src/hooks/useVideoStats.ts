import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useVideoStats = (videoId: string) => {
  const updateStats = async (
    type: 'like' | 'share',
    currentStats: { like_count?: number; share_count?: number } | null
  ) => {
    try {
      if (!currentStats) {
        // Insert new stats if none exist
        const { error: insertError } = await supabase
          .from('video_stats')
          .insert({
            video_id: videoId,
            like_count: type === 'like' ? 1 : 0,
            share_count: type === 'share' ? 1 : 0,
            view_count: 0
          });

        if (insertError) throw insertError;
      } else {
        // Update existing stats
        const { error: updateError } = await supabase
          .from('video_stats')
          .update({
            [type === 'like' ? 'like_count' : 'share_count']: 
              ((type === 'like' ? currentStats.like_count : currentStats.share_count) || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('video_id', videoId);

        if (updateError) throw updateError;
      }

      if (type === 'like') {
        toast.success("Vidéo ajoutée à vos favoris");
      }
    } catch (error) {
      console.error(`Error updating ${type} count:`, error);
      toast.error("Une erreur est survenue");
    }
  };

  return { updateStats };
};