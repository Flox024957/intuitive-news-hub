import ytdl from 'ytdl-core';

export async function getYouTubeAudioUrl(videoId: string): Promise<string> {
  try {
    const info = await ytdl.getInfo(videoId);
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    });
    return audioFormat.url;
  } catch (error) {
    console.error('Error getting YouTube audio:', error);
    throw new Error('Failed to get YouTube audio URL');
  }
}