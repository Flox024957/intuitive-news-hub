import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

export type SortOption = "recent" | "oldest" | "popular";

interface SortOptionsProps {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
}

export function SortOptions({ selected, onSelect }: SortOptionsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <span className="text-lg text-muted-foreground">Trier par:</span>
      <div className="flex gap-3">
        <Button
          variant={selected === "recent" ? "default" : "secondary"}
          size="lg"
          onClick={() => onSelect("recent")}
          className="gap-2 text-base"
        >
          Plus récent
          <ArrowDown className="w-5 h-5" />
        </Button>
        <Button
          variant={selected === "oldest" ? "default" : "secondary"}
          size="lg"
          onClick={() => onSelect("oldest")}
          className="gap-2 text-base"
        >
          Plus ancien
          <ArrowUp className="w-5 h-5" />
        </Button>
        <Button
          variant={selected === "popular" ? "default" : "secondary"}
          size="lg"
          onClick={() => onSelect("popular")}
          className="gap-2 text-base"
        >
          Populaire
          <TrendingUp className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}