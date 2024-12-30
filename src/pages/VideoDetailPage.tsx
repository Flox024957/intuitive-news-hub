import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoDetail } from "@/components/VideoDetail";
import { Navigation } from "@/components/Navigation";

const VideoDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          podcaster:podcasters(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-20">
          <h1 className="text-2xl font-bold text-center">Vidéo non trouvée</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <VideoDetail video={video} />
    </div>
  );
};

export default VideoDetailPage;