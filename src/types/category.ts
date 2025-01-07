export type VideoCategory = 
  | "all"
  | "news"
  | "politics"
  | "economy"
  | "technology"
  | "culture"
  | "personal_development"
  | "humor"
  | "music"
  | "entertainment"
  | "travel"
  | "documentary"
  | "sport"
  | "finance"
  | "tutorial"
  | "kids"
  | "movies";

export interface Category {
  id: VideoCategory;
  label: string;
  icon: any;
  color: string;
}