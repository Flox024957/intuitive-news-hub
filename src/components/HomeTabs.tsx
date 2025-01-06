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
    <Tabs defaultValue="videos" className="space-y-6">
      <TabsList className="w-full max-w-md mx-auto glass-card">
        <TabsTrigger value="videos" className="flex items-center gap-2 flex-1">
          <Play className="w-4 h-4" />
          <span>Vidéos</span>
        </TabsTrigger>
        <TabsTrigger value="trending" className="flex items-center gap-2 flex-1">
          <TrendingUp className="w-4 h-4" />
          <span>Tendances</span>
        </TabsTrigger>
        <TabsTrigger value="podcasters" className="flex items-center gap-2 flex-1">
          <Users className="w-4 h-4" />
          <span>Podcasters</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="videos">
        {children.videos}
      </TabsContent>

      <TabsContent value="trending">
        {children.trending}
      </TabsContent>

      <TabsContent value="podcasters">
        {children.podcasters}
      </TabsContent>
    </Tabs>
  );
}