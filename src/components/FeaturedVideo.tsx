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

export function FeaturedVideo({ 
  title, 
  summary, 
  thumbnail, 
  category
}: FeaturedVideoProps) {
  return (
    <Card className="relative overflow-hidden rounded-2xl glass-card group">
      <div className="aspect-video relative overflow-hidden rounded-t-2xl">
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
          className="absolute bottom-0 left-0 right-0 p-12 space-y-8"
        >
          <Badge 
            variant="secondary" 
            className="backdrop-blur-sm bg-secondary/30 text-lg px-6 py-2 rounded-full"
          >
            {category}
          </Badge>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-gradient leading-tight"
          >
            {title}
          </motion.h1>
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
            className="flex gap-6 pt-6"
          >
            <Button size="lg" className="gap-3 hover-card group text-xl h-16 px-10 rounded-full">
              <Play className="w-8 h-8 transition-transform group-hover:scale-110" />
              <span>Regarder</span>
            </Button>
            <Button size="lg" variant="secondary" className="gap-3 hover-card group text-xl h-16 px-10 rounded-full">
              <Info className="w-8 h-8 transition-transform group-hover:scale-110" />
              <span>Plus d'infos</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Card>
  );
}