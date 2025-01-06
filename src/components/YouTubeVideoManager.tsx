import { useYoutubeVideos } from "@/hooks/useYoutubeVideos";

interface YouTubeChannel {
  id: string;
  categories: string[];
}

const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  {
    id: 'IdrissJAberkane',
    categories: ["News", "Politics", "Science", "Technology", "Economy", "Culture"]
  },
  {
    id: 'sanspermissionpodcast',
    categories: ["Economy"]
  }
];

export function useYouTubeVideos() {
  const channelsData = YOUTUBE_CHANNELS.map(channel => {
    const { data, isLoading } = useYoutubeVideos(channel.id);
    return {
      videos: data?.map(video => ({
        ...video,
        categories: channel.categories
      })) || [],
      isLoading
    };
  });

  const allVideos = channelsData.flatMap(channel => channel.videos);
  const isLoading = channelsData.some(channel => channel.isLoading);

  return { videos: allVideos, isLoading };
}