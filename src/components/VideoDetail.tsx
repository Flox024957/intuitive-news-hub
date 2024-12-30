import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Database } from "@/integrations/supabase/types";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
};

interface VideoDetailProps {
  video: Video;
}

export function VideoDetail({ video }: VideoDetailProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8 animate-fade-up">
      <div className="aspect-video w-full rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_video_id}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{video.custom_title || video.title}</h1>
            <div className="flex gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(video.published_date)}
              </span>
              {video.podcaster && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {video.podcaster.name}
                </span>
              )}
            </div>
          </div>
          <Button variant="secondary" className="gap-2">
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
        </div>

        {video.categories && video.categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {video.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        )}

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Résumé</h2>
            <p className="text-muted-foreground">{video.summary}</p>
          </div>

          {video.speakers_list && video.speakers_list.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Intervenants</h2>
              <div className="flex gap-2 flex-wrap">
                {video.speakers_list.map((speaker) => (
                  <Badge key={speaker} variant="outline">
                    {speaker}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {video.full_transcript && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Transcription complète</h2>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {video.full_transcript}
                </p>
              </ScrollArea>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}