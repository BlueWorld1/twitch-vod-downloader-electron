import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Resolutions } from '../types/resolution';
import {
  extractTwitchVodIdFromUrl,
  fetchTwitchDataGQL,
  fetchVodMetadataById,
} from '../utils/utils';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { VideoResponse } from '../types/video-response';
import { VideoUrl, VodMetadata } from '../types/video';
import { ElectronWindow } from '../types/window';

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
const formats: string[] = ['mp4', 'mkv', 'avi', 'webm', 'flv', 'ogg'];

@Injectable({
  providedIn: 'root',
})
export class TwitchVodServiceService {
  private snackBar = inject(MatSnackBar);
  private vodLinkInput = new BehaviorSubject('');
  private vodInfosLoading = new BehaviorSubject(false);
  private vodInfosError = new BehaviorSubject<Error | null>(null);
  private vodFormat = new BehaviorSubject<string>(formats[0]);
  private vodInfos = this.vodLinkInput.pipe(
    debounceTime(500),
    filter((input: string) => input.length > 2),
    distinctUntilChanged(),
    tap(() => this.vodInfosError.next(null)),
    tap(() => this.vodInfosLoading.next(true)),
    switchMap((input: string) =>
      of(input).pipe(
        map(extractTwitchVodIdFromUrl),
        catchError(this.handleVideoInfoError.bind(this))
      )
    ),
    switchMap((vodId: string) =>
      fetchTwitchDataGQL(vodId).pipe(
        catchError(this.handleVideoInfoError.bind(this))
      )
    ),
    switchMap((data: VideoResponse) => fetchVodMetadataById(data, resolutions)),
    tap(() => this.vodInfosLoading.next(false))
  );

  setVodLink = (url: string): void => this.vodLinkInput.next(url);

  getVodInfos = (): Observable<VodMetadata | null> => this.vodInfos;

  getVodInfosLoading = (): Observable<boolean> => this.vodInfosLoading;

  getVodInfosError = (): Observable<Error | null> => this.vodInfosError;

  getFormats = (): string[] => formats;

  setFormat = (value: string) => this.vodFormat.next(value);

  getSelectedFormat = (): Observable<string> => this.vodFormat;

  startDownload(
    selectedSource: VideoUrl,
    selectedFormat: string,
    vodInfos: VodMetadata
  ) {
    console.log(selectedSource);
    console.log(selectedFormat);
    console.log(vodInfos);
    (window as unknown as ElectronWindow).ipcRenderer.send('vod:download', {
      selectedSource,
      selectedFormat,
      vodInfos,
    });
  }

  private handleVideoInfoError(error: Error): Observable<never> {
    this.vodInfosError.next(error);
    this.vodInfosLoading.next(false);
    this.snackBar.open(error.message, undefined, snackBarConfig);
    return EMPTY;
  }
}
