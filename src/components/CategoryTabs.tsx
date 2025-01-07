import { motion } from "framer-motion";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories, type Category } from "@/constants/categories";

interface CategoryTabsProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export function CategoryTabs({ selectedCategory, onCategorySelect }: CategoryTabsProps) {
  return (
    <TabsList className="w-full max-w-7xl mx-auto glass-morphism p-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 place-items-center min-h-[480px] rounded-2xl">
      {categories.map(({ id, label, icon: Icon, color }) => (
        <TabsTrigger 
          key={id}
          value={id} 
          className="group relative flex flex-col items-center justify-center gap-3 py-4 px-3 transition-all duration-500 hover:bg-white/5 rounded-xl w-full h-full"
          onClick={() => onCategorySelect(id)}
        >
          <Icon className={`w-6 h-6 ${color} transition-transform group-hover:scale-110`} />
          <span className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            {label}
          </span>
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: id === selectedCategory ? "100%" : 0 }}
            transition={{ duration: 0.3 }}
          />
        </TabsTrigger>
      ))}
    </TabsList>
  );
}