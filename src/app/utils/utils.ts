export const extractTwitchVodIdFromUrl = (url: string): string => {
  debugger;
  if (!url.startsWith('https://www.twitch.tv/videos/')) {
    throw new Error('Invalid Twitch URL');
  }
  return url.split('https://www.twitch.tv/videos/')[1].split('?')[0];
};
