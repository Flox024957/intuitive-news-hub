import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function YouTubeTest() {
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const extractChannelInfo = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Format: youtube.com/channel/UC...
      if (pathname.includes('/channel/')) {
        return {
          channelId: pathname.split('/channel/')[1].split('/')[0],
          username: null
        };
      }
      
      // Format: youtube.com/@username
      if (pathname.startsWith('/@')) {
        return {
          channelId: null,
          username: pathname.substring(2)
        };
      }
      
      toast.error("Format d'URL non supporté. Utilisez youtube.com/channel/ID ou youtube.com/@username");
      return null;
    } catch (error) {
      toast.error("URL invalide");
      return null;
    }
  };

  const handleFetchVideos = async () => {
    const channelInfo = extractChannelInfo(channelUrl);
    if (!channelInfo) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('youtube-data', {
        body: channelInfo
      });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      if (!data?.videos) {
        throw new Error('Aucune vidéo trouvée');
      }

      console.log('Vidéos récupérées:', data);
      toast.success(`${data.videos.length} vidéos récupérées avec succès !`);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || "Erreur lors de la récupération des vidéos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="URL de la chaîne YouTube (ex: https://www.youtube.com/@username)"
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
        Formats d'URL supportés :
        <br />- youtube.com/channel/ID
        <br />- youtube.com/@username
      </p>
    </div>
  );
}