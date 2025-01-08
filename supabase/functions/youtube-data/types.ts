export interface YouTubeResponse {
  items?: {
    id?: { channelId?: string };
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: {
        maxres?: { url: string };
        standard?: { url: string };
        high?: { url: string };
      };
      resourceId?: { videoId: string };
      publishedAt?: string;
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
    };
    contentDetails?: {
      duration?: string;
    };
  }[];
  error?: {
    errors?: { reason?: string }[];
  };
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  statistics?: {
    viewCount: string;
    likeCount?: string;
  };
}