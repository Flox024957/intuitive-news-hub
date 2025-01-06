import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
      <Input
        type="text"
        placeholder="Rechercher dans vos vidéos..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-16 py-8 text-lg rounded-2xl bg-white/5 backdrop-blur-sm border-white/10 focus:border-primary/50 transition-all duration-300"
      />
    </div>
  );
}