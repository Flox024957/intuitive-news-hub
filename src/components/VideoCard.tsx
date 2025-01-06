import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ShareButtons } from "@/components/ShareButtons";
import { motion } from "framer-motion";

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
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden hover-card glass-card">
        <Link to={`/video/${id}`}>
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <img
              src={thumbnail}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Play className="w-20 h-20 text-white" />
              </motion.div>
            </div>
          </div>
        </Link>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full">
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
          <Link to={`/video/${id}`}>
            <h3 className="text-xl font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{summary}</p>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}