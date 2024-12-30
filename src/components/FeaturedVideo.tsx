import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedVideoProps {
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
}

export function FeaturedVideo({ title, summary, thumbnail, category }: FeaturedVideoProps) {
  return (
    <Card className="relative overflow-hidden rounded-lg glass-card">
      <div className="aspect-[21/9] relative">
        <img
          src={thumbnail}
          alt={title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-6 space-y-4"
        >
          <Badge className="mb-2">{category}</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl line-clamp-2">{summary}</p>
          <div className="flex gap-4 pt-2">
            <Button size="lg" className="gap-2 hover-card">
              <Play className="w-5 h-5" /> Regarder
            </Button>
            <Button size="lg" variant="secondary" className="gap-2 hover-card">
              <Info className="w-5 h-5" /> Plus d'infos
            </Button>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}