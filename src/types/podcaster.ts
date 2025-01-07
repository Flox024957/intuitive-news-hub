import { type Json } from "@/integrations/supabase/types";

export interface Podcaster {
  id: string;
  youtube_channel_id: string;
  name: string;
  description: string;
  profile_picture_url: string | null;
  social_links: Json | null;
  created_at: string;
}