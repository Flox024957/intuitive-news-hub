import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ShareButtons } from "@/components/ShareButtons";

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
    <Card className="group relative overflow-hidden hover-card glass-card">
      <Link to={`/video/${id}`}>
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={thumbnail}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0" />
          </div>
        </div>
      </Link>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
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
          <h3 className="font-semibold line-clamp-2 leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
        </Link>
      </div>
    </Card>
  );
}