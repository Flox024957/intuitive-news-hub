import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { HomeHero } from "@/components/HomeHero";
import { HomeContent } from "@/components/HomeContent";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeSidebar } from "@/components/HomeSidebar";
import { toast } from "sonner";

const Home = () => {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      console.log("Fetching videos...");
      
      const { data: videoStats } = await supabase
        .from("video_stats")
        .select("*")
        .order("view_count", { ascending: false })
        .limit(20);

      console.log("Video stats:", videoStats);

      if (!videoStats?.length) {
        console.log("No video stats found");
        return [];
      }

      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          podcaster:podcasters(*)
        `)
        .order("published_date", { ascending: false });

      console.log("Videos data:", data);
      console.log("Videos error:", error);

      if (error) {
        toast.error("Erreur lors de la récupération des vidéos");
        throw error;
      }

      const videosWithStats = data?.map(video => ({
        ...video,
        stats: videoStats.find(stat => stat.video_id === video.id)
      }));

      console.log("Videos with stats:", videosWithStats);

      return videosWithStats;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (error) {
    console.error("Error fetching videos:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Une erreur est survenue lors du chargement des vidéos</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </motion.div>
      </div>
    );
  }

  const featuredVideo = videos?.[0];
  const trendingVideos = videos?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnimatePresence mode="wait">
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <div className="fixed top-16 left-0 bottom-0 w-56 z-30 bg-background/95 backdrop-blur-md border-r border-border shadow-lg transition-all duration-300">
              <HomeSidebar />
            </div>
            <motion.main 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 ml-56 pt-16"
            >
              <HomeHero featuredVideo={featuredVideo} />
              <HomeContent 
                videos={videos || []}
                isLoading={isLoading}
                trendingVideos={trendingVideos}
              />
            </motion.main>
          </div>
        </SidebarProvider>
      </AnimatePresence>
    </div>
  );
};

export default Home;