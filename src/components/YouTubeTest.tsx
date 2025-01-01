import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function YouTubeTest() {
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const extractChannelId = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Format: youtube.com/channel/UC...
      if (pathname.includes('/channel/')) {
        return pathname.split('/channel/')[1].split('/')[0];
      }
      
      // Format: youtube.com/c/name or youtube.com/@name
      // Ces formats nécessitent une étape supplémentaire via l'API YouTube
      // pour obtenir l'ID réel de la chaîne
      toast.error("Veuillez utiliser l'URL au format youtube.com/channel/ID");
      return null;
    } catch (error) {
      toast.error("URL invalide");
      return null;
    }
  };

  const handleFetchVideos = async () => {
    const channelId = extractChannelId(channelUrl);
    if (!channelId) return;

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
          placeholder="URL de la chaîne YouTube (ex: https://www.youtube.com/channel/UC...)"
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
        />
        <Button 
          onClick={handleFetchVideos}
          disabled={!channelUrl || loading}
        >
          {loading ? "Chargement..." : "Tester"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Pour le moment, seules les URLs au format youtube.com/channel/ID sont supportées.
        Vous pouvez trouver l'URL en allant sur la chaîne YouTube et en copiant l'URL depuis votre navigateur.
      </p>
    </div>
  );
}