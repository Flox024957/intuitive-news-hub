import { useMemo } from "react";
import { type Video, type NormalizedYouTubeVideo } from "@/types/video";

export function useNormalizedVideos(dbVideos: Video[], youtubeVideos: any[]) {
  return useMemo(() => {
    console.log("Normalizing videos from DB:", dbVideos);
    console.log("Normalizing videos from YouTube:", youtubeVideos);

    // Normaliser les vidéos YouTube
    const normalizedYoutubeVideos: NormalizedYouTubeVideo[] = youtubeVideos.map((video) => ({
      id: video.id,
      youtube_video_id: video.id,
      title: video.title,
      summary: video.description,
      thumbnail_url: video.thumbnail_url || video.thumbnail,
      published_date: video.published_date || video.publishedAt,
      categories: video.categories?.map((cat: string) => cat.toLowerCase()) || [],
      stats: {
        view_count: parseInt(video.statistics?.viewCount || "0", 10),
      },
    }));

    // Normaliser les vidéos de la base de données
    const normalizedDbVideos = dbVideos.map((video) => ({
      ...video,
      categories: video.categories?.map((cat) => cat.toLowerCase()) || [],
    }));

    // Combiner les vidéos
    const allVideos = [...normalizedDbVideos, ...normalizedYoutubeVideos];

    console.log("Combined normalized videos:", allVideos);
    return allVideos;
  }, [dbVideos, youtubeVideos]);
}