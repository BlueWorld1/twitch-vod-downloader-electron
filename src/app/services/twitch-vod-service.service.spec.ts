import { TestBed } from '@angular/core/testing';

import { TwitchVodServiceService } from './twitch-vod-service.service';

describe('TwitchVodServiceService', () => {
  let service: TwitchVodServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TwitchVodServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
