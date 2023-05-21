import { Resolutions } from '../types/resolution';
import { forkJoin, from, map, Observable, switchMap } from 'rxjs';
import { VideoUrl, VodMetadata } from '../types/video';
import { VideoResponse } from '../types/video-response';

export const extractTwitchVodIdFromUrl = (url: string): string => {
  if (!url.startsWith('https://www.twitch.tv/videos/')) {
    throw new Error('Invalid Twitch URL');
  }
  return url.split('https://www.twitch.tv/videos/')[1].split('?')[0];
};
export const fetchTwitchDataGQL = (
  vodId: string
): Observable<VideoResponse> => {
  const request = fetch('https://gql.twitch.tv/gql', {
    method: 'POST',
    body: JSON.stringify({
      query: `query { video(id: "${vodId}") { broadcastType, createdAt, seekPreviewsURL, owner { login }, title }}`,
    }),
    headers: {
      'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  return from(request).pipe(
    switchMap((resp) => resp.json()),
    map(({ data: { video } }: any) => ({
      ...video,
      vodId,
    }))
  );
};

export const fetchVodMetadataById = (
  vodData: VideoResponse,
  resolutions: Resolutions
): Observable<VodMetadata> => {
  const isValidQuality = (url: string): Observable<boolean> =>
    from(fetch(url)).pipe(map((response) => response.ok));
  const currentURL = new URL(vodData.seekPreviewsURL);
  const domain = currentURL.host;
  const paths = currentURL.pathname.split('/');
  const vodSpecialID =
    paths[paths.findIndex((element) => element.includes('storyboards')) - 1];

  const now = new Date('2023-02-10');
  const created = new Date(vodData.createdAt);
  const timeDifference = now.getTime() - created.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  const broadcastType = vodData.broadcastType.toLowerCase();

  const videoUrls$: Observable<VideoUrl>[] = Object.entries(resolutions).map(
    ([resKey, { res, fps }]) => {
      const url =
        broadcastType === 'highlight'
          ? `https://${domain}/${vodSpecialID}/${resKey}/highlight-${vodData.vodId}.m3u8`
          : broadcastType === 'upload' && daysDifference > 7
          ? `https://${domain}/${vodData.owner.login}/${vodData.vodId}/${vodSpecialID}/${resKey}/index-dvr.m3u8`
          : `https://${domain}/${vodSpecialID}/${resKey}/index-dvr.m3u8`;

      return isValidQuality(url).pipe(
        map((isValid) => {
          const quality =
            resKey === 'chunked' ? res.split('x')[1] + 'p' : resKey;
          return {
            url: isValid ? url : undefined,
            quality,
            fps,
          };
        })
      );
    }
  );
  return forkJoin(videoUrls$).pipe(
    map((urls) => ({
      owner: vodData.owner.login,
      title: vodData.title,
      videos: urls.filter(({ url }) => url),
    }))
  );
};
