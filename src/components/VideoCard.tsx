import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ShareButtons } from "@/components/ShareButtons";
import { motion } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface VideoCardProps {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
  date: string;
  viewCount?: number;
}

export function VideoCard({ 
  id, 
  title, 
  summary, 
  thumbnail, 
  category, 
  date,
  viewCount 
}: VideoCardProps) {
  const videoUrl = `${window.location.origin}/video/${id}`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="group relative overflow-hidden glass-morphism border-0 rounded-2xl">
        <Link to={`/video/${id}`}>
          <div className="aspect-video relative overflow-hidden rounded-t-2xl">
            <img
              src={thumbnail}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Play className="w-20 h-20 text-white" />
              </motion.div>
            </div>
          </div>
        </Link>
        <div className="p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border-0">
              {category}
            </Badge>
            <span className="text-xs text-muted-foreground">{date}</span>
            {viewCount !== undefined && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {viewCount}
              </span>
            )}
            <ShareButtons title={title} url={videoUrl} />
          </div>
          <div className="relative">
            <Link to={`/video/${id}`}>
              <h3 className="text-xl font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>
            </Link>
            <HoverCard openDelay={0} closeDelay={200}>
              <HoverCardTrigger>
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2 cursor-pointer hover:text-primary/80 transition-colors">
                  {summary}
                </p>
              </HoverCardTrigger>
              <HoverCardContent 
                className="w-[450px] glass-morphism border-0 backdrop-blur-xl bg-background/90 shadow-xl animate-fade-up"
                align="start"
                side="right"
                sideOffset={5}
                style={{ zIndex: 1000 }}
              >
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-primary">{title}</h4>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}