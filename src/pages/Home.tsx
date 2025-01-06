import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { HomeHero } from "@/components/HomeHero";
import { HomeContent } from "@/components/HomeContent";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeSidebar } from "@/components/HomeSidebar";

const Home = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data: videoStats } = await supabase
        .from("video_stats")
        .select("*")
        .order("view_count", { ascending: false })
        .limit(20);

      if (!videoStats?.length) return [];

      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          podcaster:podcasters(*)
        `)
        .order("published_date", { ascending: false });

      if (error) throw error;

      return data?.map(video => ({
        ...video,
        stats: videoStats.find(stat => stat.video_id === video.id)
      }));
    },
  });

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
            <HomeSidebar />
            <motion.main 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col min-h-screen relative flex-1"
            >
              <HomeHero featuredVideo={featuredVideo} />
              <div className="relative z-10 mt-[-150px]">
                <HomeContent 
                  videos={videos || []}
                  isLoading={isLoading}
                  trendingVideos={trendingVideos}
                />
              </div>
            </motion.main>
          </div>
        </SidebarProvider>
      </AnimatePresence>
    </div>
  );
};

export default Home;