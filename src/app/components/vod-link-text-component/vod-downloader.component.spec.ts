import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VodDownloaderComponent } from './vod-downloader.component';

describe('VodLinkTextComponentComponent', () => {
  let component: VodDownloaderComponent;
  let fixture: ComponentFixture<VodDownloaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VodDownloaderComponent],
    });
    fixture = TestBed.createComponent(VodDownloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
