import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, Users } from "lucide-react";
import { type Database } from "@/integrations/supabase/types";

type Video = Database['public']['Tables']['videos']['Row'] & {
  podcaster: Database['public']['Tables']['podcasters']['Row'];
};

interface VideoDetailProps {
  video: Video;
}

export function VideoDetail({ video }: VideoDetailProps) {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_video_id}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold leading-tight">
          {video.custom_title || video.title}
        </h1>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(video.published_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{video.podcaster.name}</span>
          </div>
          {video.categories?.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed">{video.summary}</p>
        </div>
      </div>

      <Tabs defaultValue="transcript" className="w-full">
        <TabsList>
          <TabsTrigger value="transcript">Transcription</TabsTrigger>
          <TabsTrigger value="speakers">
            <Users className="w-4 h-4 mr-2" />
            Intervenants
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transcript">
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="prose prose-invert max-w-none">
              {video.full_transcript?.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="speakers">
          <div className="rounded-md border p-4">
            <ul className="space-y-2">
              {video.speakers_list?.map((speaker, index) => (
                <li key={index} className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{speaker}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}