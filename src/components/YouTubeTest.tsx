import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function YouTubeTest() {
  const [channelId, setChannelId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('youtube-data', {
        body: { channelId }
      });

      if (error) {
        throw error;
      }

      console.log('Vidéos récupérées:', data);
      toast.success(`${data.videos.length} vidéos récupérées avec succès !`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la récupération des vidéos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="ID de la chaîne YouTube (ex: UC_x5XG1OV2P6uZZ5FSM9Ttw)"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
        />
        <Button 
          onClick={handleFetchVideos}
          disabled={!channelId || loading}
        >
          {loading ? "Chargement..." : "Tester"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Pour trouver l'ID d'une chaîne YouTube, allez sur la chaîne et regardez l'URL. 
        L'ID se trouve après "channel/" dans l'URL.
      </p>
    </div>
  );
}