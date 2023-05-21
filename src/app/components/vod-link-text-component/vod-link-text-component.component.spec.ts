import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VodLinkTextComponentComponent } from './vod-link-text-component.component';

describe('VodLinkTextComponentComponent', () => {
  let component: VodLinkTextComponentComponent;
  let fixture: ComponentFixture<VodLinkTextComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VodLinkTextComponentComponent],
    });
    fixture = TestBed.createComponent(VodLinkTextComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
