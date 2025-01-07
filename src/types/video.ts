export interface VideoStats {
  view_count?: number;
}

export interface Video {
  id: string;
  title: string;
  custom_title?: string | null;
  summary?: string;
  thumbnail_url: string | null;
  categories?: string[];
  published_date: string;
  stats?: VideoStats;
}