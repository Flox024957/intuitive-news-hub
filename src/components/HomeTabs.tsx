import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Users, TrendingUp } from "lucide-react";

interface HomeTabsProps {
  children: {
    videos: React.ReactNode;
    trending: React.ReactNode;
    podcasters: React.ReactNode;
  };
}

export function HomeTabs({ children }: HomeTabsProps) {
  return (
    <Tabs defaultValue="videos" className="space-y-8">
      <TabsList className="w-full max-w-2xl mx-auto glass-card p-1">
        <TabsTrigger value="videos" className="flex items-center gap-2 flex-1 py-3">
          <Play className="w-5 h-5" />
          <span className="text-lg">Vidéos</span>
        </TabsTrigger>
        <TabsTrigger value="trending" className="flex items-center gap-2 flex-1 py-3">
          <TrendingUp className="w-5 h-5" />
          <span className="text-lg">Tendances</span>
        </TabsTrigger>
        <TabsTrigger value="podcasters" className="flex items-center gap-2 flex-1 py-3">
          <Users className="w-5 h-5" />
          <span className="text-lg">Podcasters</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="videos" className="focus-visible:outline-none">
        {children.videos}
      </TabsContent>

      <TabsContent value="trending" className="focus-visible:outline-none">
        {children.trending}
      </TabsContent>

      <TabsContent value="podcasters" className="focus-visible:outline-none">
        {children.podcasters}
      </TabsContent>
    </Tabs>
  );
}