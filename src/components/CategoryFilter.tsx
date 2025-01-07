import { motion } from "framer-motion";
import { 
  Newspaper, 
  LineChart, 
  Cpu, 
  Globe, 
  Microscope, 
  Palette, 
  Film, 
  BookOpen
} from "lucide-react";

const categories = [
  { id: "all", label: "Toutes les vidéos", icon: Globe, color: "#9b87f5" },
  { id: "news", label: "Actualités", icon: Newspaper, color: "#1EAEDB" },
  { id: "politics", label: "Politique", icon: Globe, color: "#7E69AB" },
  { id: "science", label: "Science", icon: Microscope, color: "#6E59A5" },
  { id: "technology", label: "Technologie", icon: Cpu, color: "#33C3F0" },
  { id: "economy", label: "Économie", icon: LineChart, color: "#0EA5E9" },
  { id: "culture", label: "Culture", icon: Palette, color: "#8B5CF6" },
  { id: "entertainment", label: "Divertissement", icon: Film, color: "#D3E4FD" }
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(category.id)}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl
            transition-all duration-300 hover:shadow-lg
            ${selected.toLowerCase() === category.id 
              ? 'bg-primary/20 shadow-lg border border-primary/20' 
              : 'glass-morphism hover:bg-secondary/40'
            }
          `}
        >
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <category.icon 
              className="w-6 h-6 transition-transform group-hover:scale-110" 
              style={{ color: category.color }}
            />
          </div>
          <span className="text-sm font-medium text-center">
            {category.label}
          </span>
          {selected.toLowerCase() === category.id && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 rounded-xl ring-2 ring-primary/50"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}