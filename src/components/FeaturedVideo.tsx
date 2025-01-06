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
    <Card className="relative overflow-hidden rounded-3xl glass-morphism group border-0">
      <div className="aspect-video relative overflow-hidden rounded-3xl">
        <motion.img
          src={thumbnail}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
          loading="lazy"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 p-16 space-y-8"
        >
          <Badge 
            variant="secondary" 
            className="backdrop-blur-md bg-white/10 text-lg px-8 py-2 rounded-full border-0 shadow-lg"
          >
            {category}
          </Badge>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-6xl sm:text-7xl md:text-8xl font-bold text-gradient leading-tight tracking-tight"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl text-muted-foreground max-w-3xl line-clamp-3"
          >
            {summary}
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-6 pt-8"
          >
            <Button 
              size="lg" 
              className="gap-3 group text-xl h-16 px-12 rounded-full bg-primary hover:bg-primary/90 transition-all duration-500 hover:scale-105"
            >
              <Play className="w-8 h-8 transition-transform group-hover:scale-110" />
              <span>Regarder</span>
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-3 group text-xl h-16 px-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-lg transition-all duration-500 hover:scale-105"
            >
              <Info className="w-8 h-8 transition-transform group-hover:scale-110" />
              <span>Plus d'infos</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Card>
  );
}