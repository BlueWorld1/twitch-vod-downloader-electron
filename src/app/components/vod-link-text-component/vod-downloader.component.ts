import { Component, inject } from '@angular/core';
import { TwitchVodServiceService } from '../../services/twitch-vod-service.service';
import { MatSelectChange } from '@angular/material/select';
import { VideoUrl, VodMetadata } from '../../types/video';

@Component({
  selector: 'app-vod-downloader-component',
  templateUrl: './vod-downloader.component.html',
  styleUrls: ['./vod-downloader.component.scss'],
})
export class VodDownloaderComponent {
  private twitchVodService = inject(TwitchVodServiceService);
  vodInfos = this.twitchVodService.getVodInfos();
  formats = this.twitchVodService.getFormats();
  selectedFormat = this.twitchVodService.getSelectedFormat();
  vodInfosLoading = this.twitchVodService.getVodInfosLoading();
  vodDownloading = this.twitchVodService.getVodDownloading();
  vodInfosError = this.twitchVodService.getVodInfosError();

  vodLinkChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.twitchVodService.setVodLink(target.value);
  }

  formatSelected({ value }: MatSelectChange) {
    this.twitchVodService.setFormat(value);
  }

  sourceSelected(
    $event: MatSelectChange,
    selectedFormat: string | null,
    vodInfos: VodMetadata
  ) {
    this.twitchVodService.startDownload(
      $event.value as VideoUrl,
      selectedFormat as string,
      vodInfos
    );
  }
}
