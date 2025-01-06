import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "News",
  "Politics",
  "Science",
  "Technology",
  "Economy",
  "Culture",
  "Divertissement",
  "Tutoriels",
  "Reportages"
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "secondary"}
          size="lg"
          className="whitespace-nowrap text-base px-6"
          onClick={() => onSelect(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}