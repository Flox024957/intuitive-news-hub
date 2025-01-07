import { motion } from "framer-motion";
import { categories } from "@/constants/categories";

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