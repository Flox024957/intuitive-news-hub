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
          className="absolute bottom-0 left-0 right-0 p-8 space-y-6"
        >
          <Badge 
            variant="secondary" 
            className="backdrop-blur-sm bg-secondary/30 text-lg px-4 py-2"
          >
            {category}
          </Badge>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient leading-tight"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-muted-foreground max-w-2xl line-clamp-3"
          >
            {summary}
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 pt-4"
          >
            <Button size="lg" className="gap-2 hover-card group text-lg h-14 px-8">
              <Play className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span>Regarder</span>
            </Button>
            <Button size="lg" variant="secondary" className="gap-2 hover-card group text-lg h-14 px-8">
              <Info className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span>Plus d'infos</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Card>
  );
}