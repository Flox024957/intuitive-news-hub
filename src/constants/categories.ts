import { 
  Grid, 
  Newspaper, 
  Globe, 
  LineChart, 
  Microscope, 
  Cpu, 
  Palette, 
  Film, 
  BookOpen, 
  Laugh, 
  Music,
  Brain
} from "lucide-react";

export interface Category {
  id: string;
  label: string;
  icon: typeof Grid;
  color: string;
}

export const categories: Category[] = [
  { id: "all", label: "Toutes les vidéos", icon: Grid, color: "text-blue-500" },
  { id: "news", label: "Actualités", icon: Newspaper, color: "text-red-500" },
  { id: "politics", label: "Politique", icon: Globe, color: "text-green-500" },
  { id: "economy", label: "Économie", icon: LineChart, color: "text-yellow-500" },
  { id: "science", label: "Science", icon: Microscope, color: "text-purple-500" },
  { id: "technology", label: "Technologie", icon: Cpu, color: "text-cyan-500" },
  { id: "culture", label: "Culture", icon: Palette, color: "text-pink-500" },
  { id: "entertainment", label: "Divertissement", icon: Film, color: "text-orange-500" },
  { id: "tutorials", label: "Tutoriels", icon: BookOpen, color: "text-indigo-500" },
  { id: "humor", label: "Humour", icon: Laugh, color: "text-amber-500" },
  { id: "music", label: "Musique", icon: Music, color: "text-rose-500" },
  { id: "development", label: "Développement personnel", icon: Brain, color: "text-violet-500" }
];