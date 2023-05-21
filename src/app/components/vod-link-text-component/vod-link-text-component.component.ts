import { Component, inject } from '@angular/core';
import { TwitchVodServiceService } from '../../services/twitch-vod-service.service';

@Component({
  selector: 'app-vod-link-text-component',
  templateUrl: './vod-link-text-component.component.html',
  styleUrls: ['./vod-link-text-component.component.scss'],
})
export class VodLinkTextComponentComponent {
  private twitchVodService = inject(TwitchVodServiceService);
  vodInfos = this.twitchVodService.getVodInfo();

  vodLinkChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    this.twitchVodService.setVodLink(target.value);
  }
}
