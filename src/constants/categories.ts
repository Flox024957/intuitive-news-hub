import { 
  Grid, 
  Newspaper, 
  Globe, 
  LineChart, 
  Cpu, 
  Palette, 
  Film,
  Laugh,
  Music,
  Plane,
  Camera,
  Trophy,
  DollarSign,
  GraduationCap,
  Baby,
  Clapperboard
} from "lucide-react";
import { type Category, type VideoCategory } from "@/types/category";

export const categories: Category[] = [
  { id: "all", label: "Toutes les vidéos", icon: Grid, color: "text-blue-500" },
  { id: "news", label: "Actualités", icon: Newspaper, color: "text-red-500" },
  { id: "politics", label: "Politique", icon: Globe, color: "text-green-500" },
  { id: "economy", label: "Économie", icon: LineChart, color: "text-yellow-500" },
  { id: "technology", label: "Technologie", icon: Cpu, color: "text-cyan-500" },
  { id: "culture", label: "Culture", icon: Palette, color: "text-pink-500" },
  { id: "personal_development", label: "Développement personnel", icon: GraduationCap, color: "text-indigo-500" },
  { id: "humor", label: "Humour", icon: Laugh, color: "text-emerald-500" },
  { id: "music", label: "Musique", icon: Music, color: "text-purple-500" },
  { id: "entertainment", label: "Divertissement", icon: Film, color: "text-orange-500" },
  { id: "travel", label: "Voyage", icon: Plane, color: "text-sky-500" },
  { id: "documentary", label: "Reportages", icon: Camera, color: "text-rose-500" },
  { id: "sport", label: "Sport", icon: Trophy, color: "text-lime-500" },
  { id: "finance", label: "$$$", icon: DollarSign, color: "text-amber-500" },
  { id: "tutorial", label: "Tutoriels", icon: GraduationCap, color: "text-violet-500" },
  { id: "kids", label: "Enfants", icon: Baby, color: "text-fuchsia-500" },
  { id: "movies", label: "Films", icon: Clapperboard, color: "text-teal-500" }
];