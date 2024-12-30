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
    <Card className="relative overflow-hidden rounded-lg glass-card group">
      <div className="aspect-[21/9] relative">
        <motion.img
          src={thumbnail}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 p-6 space-y-4"
        >
          <Badge 
            variant="secondary" 
            className="backdrop-blur-sm bg-secondary/30"
          >
            {category}
          </Badge>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground max-w-2xl line-clamp-2"
          >
            {summary}
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 pt-2"
          >
            <Button size="lg" className="gap-2 hover-card group">
              <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Regarder</span>
            </Button>
            <Button size="lg" variant="secondary" className="gap-2 hover-card group">
              <Info className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Plus d'infos</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Card>
  );
}