import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamAppComponent } from './steam-app.component';

describe('SteamAppComponent', () => {
  let component: SteamAppComponent;
  let fixture: ComponentFixture<SteamAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SteamAppComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
