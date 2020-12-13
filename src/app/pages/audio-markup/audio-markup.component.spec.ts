import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioMarkupComponent } from './audio-markup.component';

describe('AudioMarkupComponent', () => {
  let component: AudioMarkupComponent;
  let fixture: ComponentFixture<AudioMarkupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioMarkupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioMarkupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
