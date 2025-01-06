import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ContentType = 'transcript' | 'summary' | 'article';

export async function getCachedContent(videoId: string, contentType: ContentType): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('content_cache')
      .select('content')
      .eq('video_id', videoId)
      .eq('content_type', contentType)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching ${contentType} from cache:`, error);
      return null;
    }

    return data?.content || null;
  } catch (error) {
    console.error(`Error in getCachedContent for ${contentType}:`, error);
    return null;
  }
}

export async function setCachedContent(
  videoId: string, 
  contentType: ContentType, 
  content: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('content_cache')
      .upsert({
        video_id: videoId,
        content_type: contentType,
        content,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Error caching ${contentType}:`, error);
      toast.error(`Erreur lors de la mise en cache du ${contentType}`);
      return false;
    }

    console.log(`${contentType} cached successfully`);
    return true;
  } catch (error) {
    console.error(`Error in setCachedContent for ${contentType}:`, error);
    toast.error(`Erreur inattendue lors de la mise en cache`);
    return false;
  }
}