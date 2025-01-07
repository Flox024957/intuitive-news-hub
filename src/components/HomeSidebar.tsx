import { Link } from "react-router-dom";
import { 
  Home, 
  User, 
  TrendingUp, 
  Users,
  Newspaper,
  LineChart,
  CircuitBoard,
  Brain,
  Building2,
  Gamepad2,
  Heart,
  GraduationCap,
  Palette,
  Trophy,
  Leaf,
  Scale
} from "lucide-react";

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

const navigationItems = [
  {
    title: "Accueil",
    url: "/home",
    icon: Home,
    iconColor: "#9b87f5", // Primary Purple
  },
  {
    title: "Ma page",
    url: "/personal",
    icon: User,
    iconColor: "#7E69AB", // Secondary Purple
  },
  {
    title: "Tendances",
    url: "#trending",
    icon: TrendingUp,
    iconColor: "#6E59A5", // Tertiary Purple
  },
  {
    title: "Podcasters",
    url: "#podcasters",
    icon: Users,
    iconColor: "#8B5CF6", // Vivid Purple
  },
];

const sectionItems = [
  {
    title: "Actualités",
    url: "#actualites",
    icon: Newspaper,
    iconColor: "#1EAEDB", // Bright Blue
  },
  {
    title: "Économie",
    url: "#economie",
    icon: LineChart,
    iconColor: "#0FA0CE", // Bright Blue
  },
  {
    title: "Technologie",
    url: "#technologie",
    icon: CircuitBoard,
    iconColor: "#33C3F0", // Sky Blue
  },
  {
    title: "Développement personnel",
    url: "#developpement-personnel",
    icon: Brain,
    iconColor: "#0EAED9", // Ocean Blue
  },
  {
    title: "Business",
    url: "#business",
    icon: Building2,
    iconColor: "#E5DEFF", // Soft Purple
  },
  {
    title: "Gaming",
    url: "#gaming",
    icon: Gamepad2,
    iconColor: "#D3E4FD", // Soft Blue
  },
  {
    title: "Santé",
    url: "#sante",
    icon: Heart,
    iconColor: "#8B5CF6", // Vivid Purple
  },
  {
    title: "Éducation",
    url: "#education",
    icon: GraduationCap,
    iconColor: "#9b87f5", // Primary Purple
  },
  {
    title: "Art & Culture",
    url: "#art-culture",
    icon: Palette,
    iconColor: "#7E69AB", // Secondary Purple
  },
  {
    title: "Sport",
    url: "#sport",
    icon: Trophy,
    iconColor: "#6E59A5", // Tertiary Purple
  },
  {
    title: "Environnement",
    url: "#environnement",
    icon: Leaf,
    iconColor: "#33C3F0", // Sky Blue
  },
  {
    title: "Droit",
    url: "#droit",
    icon: Scale,
    iconColor: "#0EAED9", // Ocean Blue
  },
];

export function HomeSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.url.startsWith("#") ? (
                      <a href={item.url}>
                        <item.icon className="w-4 h-4" style={{ color: item.iconColor }} />
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" style={{ color: item.iconColor }} />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sectionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" style={{ color: item.iconColor }} />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}