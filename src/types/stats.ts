export interface VideoStats {
  id: string;
  video_id: string;
  view_count: number | null;
  like_count: number | null;
  share_count: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}