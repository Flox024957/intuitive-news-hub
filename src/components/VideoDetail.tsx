import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, User, Heart, Share2 } from "lucide-react";
import { type Database } from "@/integrations/supabase/types";
import { VideoProcessing } from "@/components/VideoProcessing";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
};

interface VideoDetailProps {
  video: Video;
}

export function VideoDetail({ video }: VideoDetailProps) {
  const [summary, setSummary] = useState<string | null>(video.summary);

  useEffect(() => {
    // Increment view count when video is loaded
    const incrementViewCount = async () => {
      try {
        const { error } = await supabase.rpc('increment_view_count', {
          video_id_param: video.id
        });
        if (error) throw error;
      } catch (error) {
        console.error("Error incrementing view count:", error);
      }
    };
    incrementViewCount();
  }, [video.id]);

  const handleSummaryGenerated = async (newSummary: string) => {
    setSummary(newSummary);
    
    try {
      await supabase
        .from('videos')
        .update({ summary: newSummary })
        .eq('id', video.id);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du résumé:", error);
    }
  };

  const handleLike = () => {
    toast.success("Vidéo ajoutée à vos favoris");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier");
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="aspect-video relative rounded-lg overflow-hidden shadow-xl">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_video_id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {video.custom_title || video.title}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <time dateTime={video.published_date}>
                {new Date(video.published_date).toLocaleDateString()}
              </time>
              {video.categories?.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="outline"
              onClick={handleLike}
              className="hover:text-red-500 hover:border-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="outline"
              onClick={handleShare}
              className="hover:text-blue-500 hover:border-blue-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {video.podcaster?.profile_picture_url ? (
                <img
                  src={video.podcaster.profile_picture_url}
                  alt={video.podcaster.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h2 className="font-semibold">{video.podcaster?.name}</h2>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {video.podcaster?.description}
              </p>
            </div>
            <Button className="ml-auto" variant="secondary">
              Suivre
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="summary">Résumé</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-4">
            <Card className="p-4">
              {summary ? (
                <p className="text-lg leading-relaxed">{summary}</p>
              ) : (
                <VideoProcessing
                  videoId={video.id}
                  transcript={video.full_transcript}
                  onSummaryGenerated={handleSummaryGenerated}
                />
              )}
            </Card>
          </TabsContent>
          <TabsContent value="transcript" className="mt-4">
            <Card className="p-4">
              <ScrollArea className="h-[400px] w-full rounded-md">
                <div className="space-y-4">
                  {video.full_transcript?.split('\n').map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}