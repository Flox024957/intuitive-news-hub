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
  },
  {
    title: "Ma page",
    url: "/personal",
    icon: User,
  },
  {
    title: "Tendances",
    url: "#trending",
    icon: TrendingUp,
  },
  {
    title: "Podcasters",
    url: "#podcasters",
    icon: Users,
  },
];

const sectionItems = [
  {
    title: "Actualités",
    url: "#actualites",
    icon: Newspaper,
  },
  {
    title: "Économie",
    url: "#economie",
    icon: LineChart,
  },
  {
    title: "Technologie",
    url: "#technologie",
    icon: CircuitBoard,
  },
  {
    title: "Développement personnel",
    url: "#developpement-personnel",
    icon: Brain,
  },
  {
    title: "Business",
    url: "#business",
    icon: Building2,
  },
  {
    title: "Gaming",
    url: "#gaming",
    icon: Gamepad2,
  },
  {
    title: "Santé",
    url: "#sante",
    icon: Heart,
  },
  {
    title: "Éducation",
    url: "#education",
    icon: GraduationCap,
  },
  {
    title: "Art & Culture",
    url: "#art-culture",
    icon: Palette,
  },
  {
    title: "Sport",
    url: "#sport",
    icon: Trophy,
  },
  {
    title: "Environnement",
    url: "#environnement",
    icon: Leaf,
  },
  {
    title: "Droit",
    url: "#droit",
    icon: Scale,
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
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    ) : (
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" />
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
                      <item.icon className="w-4 h-4" />
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