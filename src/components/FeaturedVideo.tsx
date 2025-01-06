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
    <Card className="relative overflow-hidden rounded-2xl glass-morphism group border-0 shadow-2xl">
      <div className="aspect-video relative overflow-hidden rounded-2xl">
        <motion.img
          src={thumbnail}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 p-8 space-y-6"
        >
          <Badge 
            variant="secondary" 
            className="backdrop-blur-md bg-white/10 text-base px-6 py-1.5 rounded-full border-0 shadow-lg"
          >
            {category}
          </Badge>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient leading-tight tracking-tight"
          >
            {title}
          </motion.h1>
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
            className="flex gap-4 pt-4"
          >
            <Button 
              size="lg" 
              className="gap-2 group text-base px-8 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Regarder</span>
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2 group text-base px-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-lg transition-all duration-300 hover:scale-105"
            >
              <Info className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Plus d'infos</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Card>
  );
}