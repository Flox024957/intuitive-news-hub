import { type VideoStats } from "./stats";
import { type Podcaster } from "./podcaster";

export interface Video {
  id: string;
  youtube_video_id: string;
  title: string;
  custom_title?: string | null;
  summary?: string | null;
  speakers_list?: string[] | null;
  full_transcript?: string | null;
  published_date: string;
  thumbnail_url: string | null;
  podcaster_id?: string | null;
  video_url: string;
  categories?: string[] | null;
  created_at: string;
  article_content?: string | null;
  stats?: VideoStats | null;
  podcaster?: Podcaster | null;
}

export interface NormalizedYouTubeVideo {
  id: string;
  youtube_video_id: string;
  title: string;
  summary?: string | null;
  thumbnail_url: string;
  published_date: string;
  categories?: string[];
  stats?: {
    view_count: number;
  };
}