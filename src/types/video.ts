import { type VideoStats } from "./stats";
import { type Podcaster } from "./podcaster";
import { type VideoCategory } from "./category";

export interface Video {
  id: string;
  youtube_video_id: string;
  title: string;
  custom_title: string | null;
  summary: string | null;
  speakers_list: string[] | null;
  full_transcript: string | null;
  published_date: string;
  thumbnail_url: string | null;
  podcaster_id: string | null;
  video_url: string;
  categories: VideoCategory[];
  created_at: string;
  article_content: string | null;
  podcaster: Podcaster | null;
  stats: VideoStats | null;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  categories?: VideoCategory[];
  statistics?: {
    viewCount: string;
    likeCount?: string;
    commentCount?: string;
  };
}

export type NormalizedVideo = Video | YouTubeVideo;