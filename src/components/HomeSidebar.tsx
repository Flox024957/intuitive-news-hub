import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, TrendingUp, Users, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { create } from "zustand";

type VideoDescription = {
  title: string;
  description: string;
} | null;

type VideoStore = {
  hoveredVideo: VideoDescription;
  setHoveredVideo: (video: VideoDescription) => void;
};

export const useVideoStore = create<VideoStore>((set) => ({
  hoveredVideo: null,
  setHoveredVideo: (video) => set({ hoveredVideo: video }),
}));

const menuItems = [
  {
    title: "Accueil",
    icon: Home,
    path: "/home",
  },
  {
    title: "Tendances",
    icon: TrendingUp,
    path: "/home",
  },
  {
    title: "Podcasters",
    icon: Users,
    path: "/home",
  },
];

export function HomeSidebar() {
  const hoveredVideo = useVideoStore((state) => state.hoveredVideo);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Description
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-4 space-y-4 glass-morphism rounded-lg">
              {hoveredVideo ? (
                <>
                  <h3 className="text-lg font-semibold text-primary line-clamp-2">
                    {hoveredVideo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {hoveredVideo.description}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Survolez une vidéo pour voir sa description
                </p>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}