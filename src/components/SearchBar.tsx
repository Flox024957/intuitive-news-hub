import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        type="text"
        placeholder="Rechercher dans vos vidéos..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-12 py-6 text-lg rounded-xl bg-background/50"
      />
    </div>
  );
}