import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "News",
  "Politics",
  "Science",
  "Technology",
  "Economy",
  "Culture",
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "secondary"}
          className="whitespace-nowrap"
          onClick={() => onSelect(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}