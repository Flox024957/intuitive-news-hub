import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, Share2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useVideoStats } from "@/hooks/useVideoStats";

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
  viewCount = 0
}: VideoCardProps) {
  const videoUrl = `${window.location.origin}/video/${id}`;
  const { updateStats } = useVideoStats(id);
  
  const handleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour aimer une vidéo");
        return;
      }

      const { data: currentStats } = await supabase
        .from('video_stats')
        .select('like_count')
        .eq('video_id', id)
        .maybeSingle();

      await updateStats('like', currentStats);
    } catch (error) {
      console.error('Error in handleLike:', error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        text: summary,
        url: videoUrl
      });
      
      const { data: currentStats } = await supabase
        .from('video_stats')
        .select('share_count')
        .eq('video_id', id)
        .maybeSingle();

      await updateStats('share', currentStats);
    } catch (error) {
      console.error('Error in handleShare:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Une erreur est survenue lors du partage");
      }
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative h-full"
    >
      <Card className="group relative overflow-hidden glass-morphism border-0 rounded-2xl h-full flex flex-col">
        <Link to={`/video/${id}`} className="flex-shrink-0">
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
        <div className="p-6 space-y-4 flex-grow flex flex-col">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="text-xs px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border-0">
              {category}
            </Badge>
            <span className="text-xs text-muted-foreground">{date}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Eye className="w-3 h-3" />
              {viewCount?.toLocaleString('fr-FR')}
            </span>
          </div>
          <div className="flex-grow">
            <Link to={`/video/${id}`}>
              <h3 className="text-xl font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
              {summary}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4 mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleLike}
            >
              <Heart className="w-4 h-4" />
              <span className="sr-only">Aimer</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              <span className="sr-only">Partager</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}