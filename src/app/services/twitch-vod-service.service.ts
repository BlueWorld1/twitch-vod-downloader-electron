import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Resolutions } from '../types/resolution';
import { extractTwitchVodIdFromUrl } from '../utils/utils';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { VideoResponse } from '../types/video-response';

const snackBarConfig: MatSnackBarConfig = {
  duration: 3000,
  horizontalPosition: 'center',
  verticalPosition: 'bottom',
};
const resolutions: Resolutions = {
  chunked: { res: '1920x1080', fps: 60 },
  '1080p60': { res: '1920x1080', fps: 60 },
  '720p60': { res: '1280x720', fps: 60 },
  '480p30': { res: '854x480', fps: 30 },
  '360p30': { res: '640x360', fps: 30 },
  '160p30': { res: '284x160', fps: 30 },
};

@Injectable({
  providedIn: 'root',
})
export class TwitchVodServiceService {
  private snackBar = inject(MatSnackBar);

  private vodLinkInput = new BehaviorSubject('');
  private vodInfosLoading = new BehaviorSubject(false);

  setVodLink(url: string): void {
    this.vodLinkInput.next(url);
  }

  getVodInfo(): Observable<VideoResponse | null> {
    return this.vodInfos;
  }

  private fetchTwitchDataGQL = (vodID: string): Observable<VideoResponse> => {
    const request = fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      body: JSON.stringify({
        query: `query { video(id: "${vodID}") { broadcastType, createdAt, seekPreviewsURL, owner { login }, title }}`,
      }),
      headers: {
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return from(request).pipe(switchMap((resp) => resp.json()));
  };

  private vodInfos = this.vodLinkInput.pipe(
    debounceTime(500),
    filter((input: string) => input.length > 2),
    distinctUntilChanged(),
    tap(() => this.vodInfosLoading.next(true)),
    switchMap((input: string) =>
      of(input).pipe(
        map(extractTwitchVodIdFromUrl),
        catchError(this.handleVideoInfoError.bind(this))
      )
    ),
    switchMap((url: string) =>
      this.fetchTwitchDataGQL(url).pipe(
        catchError(this.handleVideoInfoError.bind(this))
      )
    ),
    tap(() => this.vodInfosLoading.next(false))
  );

  private handleVideoInfoError(error: Error): Observable<never> {
    this.vodInfosLoading.next(false);
    this.snackBar.open(error.message, undefined, snackBarConfig);
    return EMPTY;
  }
}
