import { useMemo } from "react";
import { type Video, type NormalizedYouTubeVideo } from "@/types/video";

export function useNormalizedVideos(dbVideos: Video[], youtubeVideos: any[]) {
  return useMemo(() => {
    console.log("Normalizing videos from DB:", dbVideos);
    console.log("Normalizing videos from YouTube:", youtubeVideos);

    // Normaliser les vidéos YouTube
    const normalizedYoutubeVideos: Video[] = youtubeVideos.map((video) => ({
      id: video.id,
      youtube_video_id: video.id,
      title: video.title,
      summary: video.description,
      thumbnail_url: video.thumbnail_url || video.thumbnail,
      published_date: video.published_date || video.publishedAt,
      video_url: `https://www.youtube.com/watch?v=${video.id}`,
      categories: video.categories?.map((cat: string) => cat.toLowerCase()) || ['news'],
      created_at: new Date().toISOString(),
      custom_title: null,
      speakers_list: null,
      full_transcript: null,
      podcaster_id: null,
      article_content: null,
      podcaster: null,
      stats: {
        view_count: parseInt(video.statistics?.viewCount || "0", 10),
      }
    }));

    // Normaliser les vidéos de la base de données
    const normalizedDbVideos = dbVideos.map((video) => ({
      ...video,
      categories: video.categories?.map((cat) => cat.toLowerCase()) || [],
    }));

    // Combiner les vidéos en évitant les doublons
    const allVideos = [...normalizedDbVideos];
    
    // Ajouter uniquement les vidéos YouTube qui n'existent pas déjà dans la DB
    normalizedYoutubeVideos.forEach((ytVideo) => {
      const exists = allVideos.some(
        (dbVideo) => dbVideo.youtube_video_id === ytVideo.youtube_video_id
      );
      if (!exists) {
        allVideos.push(ytVideo);
      }
    });

    console.log("Combined normalized videos:", allVideos);
    return allVideos;
  }, [dbVideos, youtubeVideos]);
}