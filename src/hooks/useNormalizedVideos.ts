import { useMemo } from "react";
import { type Video, type YouTubeVideo } from "@/types/video";

export function useNormalizedVideos(dbVideos: Video[], youtubeVideos: YouTubeVideo[]) {
  return useMemo(() => {
    console.log("Normalizing videos from DB:", dbVideos);
    console.log("Normalizing videos from YouTube:", youtubeVideos);

    // Normaliser les vidéos YouTube
    const normalizedYoutubeVideos: Video[] = youtubeVideos.map((video) => ({
      id: video.id,
      youtube_video_id: video.id,
      title: video.title,
      custom_title: null,
      summary: video.description || null,
      thumbnail_url: video.thumbnail || null,
      published_date: video.publishedAt,
      video_url: `https://www.youtube.com/watch?v=${video.id}`,
      categories: ['news'],  // Catégorie par défaut, sera mise à jour par le trigger
      created_at: new Date().toISOString(),
      speakers_list: null,
      full_transcript: null,
      podcaster_id: null,
      article_content: null,
      podcaster: null,
      stats: video.statistics ? {
        id: crypto.randomUUID(),
        video_id: video.id,
        view_count: parseInt(video.statistics.viewCount || "0", 10),
        like_count: parseInt(video.statistics.likeCount || "0", 10),
        share_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : null
    }));

    // Normaliser les vidéos de la base de données
    const normalizedDbVideos = dbVideos.map((video) => ({
      ...video,
      categories: video.categories || ['news'],  // S'assurer que categories n'est jamais null
      stats: video.stats || {
        id: crypto.randomUUID(),
        video_id: video.id,
        view_count: 0,
        like_count: 0,
        share_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
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