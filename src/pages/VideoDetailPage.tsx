import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { VideoDetail } from "@/components/VideoDetail";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Database } from "@/integrations/supabase/types";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
};

const VideoDetailPage = () => {
  const { id } = useParams();

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      console.log("Fetching video with YouTube ID:", id);
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          podcaster:podcasters(*)
        `)
        .eq('youtube_video_id', id)
        .single();

      if (error) {
        console.error("Error fetching video:", error);
        throw error;
      }
      
      console.log("Fetched video data:", data);
      return data as Video;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-20">
          <div className="animate-pulse space-y-8">
            <div className="aspect-video bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Vidéo non trouvée</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-20">
        <VideoDetail video={video} />
      </main>
    </div>
  );
};

export default VideoDetailPage;