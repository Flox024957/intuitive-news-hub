import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SortOption = "recent" | "oldest" | "popular";

interface SortOptionsProps {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
}

export function SortOptions({ selected, onSelect }: SortOptionsProps) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-muted-foreground">Trier par:</span>
      <div className="flex gap-2">
        <Button
          variant={selected === "recent" ? "default" : "secondary"}
          size="sm"
          onClick={() => onSelect("recent")}
          className="gap-2"
        >
          Plus récent
          <ArrowDown className="w-4 h-4" />
        </Button>
        <Button
          variant={selected === "oldest" ? "default" : "secondary"}
          size="sm"
          onClick={() => onSelect("oldest")}
          className="gap-2"
        >
          Plus ancien
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button
          variant={selected === "popular" ? "default" : "secondary"}
          size="sm"
          onClick={() => onSelect("popular")}
        >
          Populaire
        </Button>
      </div>
    </div>
  );
}