export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  statistics?: {
    viewCount?: string;
    likeCount?: string;
  };
}