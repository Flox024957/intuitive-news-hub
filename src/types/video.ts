export interface VideoStats {
  id: string;
  video_id: string;
  view_count: number;
  like_count: number;
  share_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Podcaster {
  id: string;
  youtube_channel_id: string;
  name: string;
  description?: string;
  profile_picture_url?: string;
  social_links?: Record<string, string>;
  created_at: string;
}

export interface Video {
  id: string;
  youtube_video_id: string;
  title: string;
  custom_title?: string | null;
  summary?: string;
  speakers_list?: string[];
  full_transcript?: string;
  published_date: string;
  thumbnail_url: string | null;
  podcaster_id?: string;
  video_url: string;
  categories?: string[];
  created_at: string;
  article_content?: string;
  stats?: VideoStats;
  podcaster?: Podcaster;
}

export interface NormalizedYouTubeVideo {
  id: string;
  youtube_video_id: string;
  title: string;
  summary?: string;
  thumbnail_url: string;
  published_date: string;
  categories?: string[];
  stats?: {
    view_count: number;
  };
}