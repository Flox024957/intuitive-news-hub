import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";
import { SortOptions, type SortOption } from "@/components/SortOptions";

interface VideosHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function VideosHeader({
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange
}: VideosHeaderProps) {
  return (
    <motion.div 
      className="flex flex-col gap-8 glass-morphism p-12 rounded-3xl shadow-2xl border-0"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <Sparkles className="w-10 h-10 text-primary animate-pulse" />
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Dernières vidéos
        </h2>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="flex-1 min-w-[280px]">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
        </div>
        <div className="flex-[2]">
          <SortOptions selected={sortOption} onSelect={onSortChange} />
        </div>
      </div>
    </motion.div>
  );
}