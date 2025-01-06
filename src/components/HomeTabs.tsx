import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface HomeTabsProps {
  children: {
    videos: React.ReactNode;
    trending: React.ReactNode;
    podcasters: React.ReactNode;
  };
}

export function HomeTabs({ children }: HomeTabsProps) {
  return (
    <Tabs defaultValue="videos" className="space-y-12">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-20 z-50 w-full bg-background/80 backdrop-blur-lg py-6"
      >
        <TabsList className="w-full max-w-2xl mx-auto glass-card p-2">
          <TabsTrigger value="videos" className="flex items-center gap-2 flex-1 py-4 transition-all duration-300">
            <Play className="w-5 h-5" />
            <span className="text-base font-medium">Vidéos</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2 flex-1 py-4 transition-all duration-300">
            <TrendingUp className="w-5 h-5" />
            <span className="text-base font-medium">Tendances</span>
          </TabsTrigger>
          <TabsTrigger value="podcasters" className="flex items-center gap-2 flex-1 py-4 transition-all duration-300">
            <Users className="w-5 h-5" />
            <span className="text-base font-medium">Podcasters</span>
          </TabsTrigger>
        </TabsList>
      </motion.div>

      <TabsContent value="videos" className="focus-visible:outline-none mt-8">
        {children.videos}
      </TabsContent>

      <TabsContent value="trending" className="focus-visible:outline-none mt-8">
        {children.trending}
      </TabsContent>

      <TabsContent value="podcasters" className="focus-visible:outline-none mt-8">
        {children.podcasters}
      </TabsContent>
    </Tabs>
  );
}