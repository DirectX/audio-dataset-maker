import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-waveform-view',
  templateUrl: './waveform-view.component.html',
  styleUrls: ['./waveform-view.component.scss']
})
export class WaveformViewComponent implements AfterViewInit {
    public progress = 0;
    public playing = false;
    private wavesurfer!: WaveSurfer;

    private _url = '';
    @Input()
    set url(url: string){
      this._url = url;
      if (this.url) {
        this.wavesurfer?.load(this.url);
      }
    }
    get url(): string{
      return this._url;
    }

    @Input() waveColor = '#3c3';
    @Input() progressColor = '#3ad';
    @Input() cursorColor = '#ccc';

    @ViewChild('wavesurfer') private ws!: ElementRef;

    constructor(private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
      requestAnimationFrame(() => {
        this.wavesurfer = WaveSurfer.create({
          container: this.ws.nativeElement,
          waveColor: this.waveColor,
          progressColor: this.progressColor,
          cursorColor: this.cursorColor,
          height: 60
        });
        this.wavesurfer.on('play', () => {
          this.playing = true;
        });
        this.wavesurfer.on('pause', () => {
          this.playing = false;
        });
        this.wavesurfer.on('finish', () => {
          this.playing = false;
          this.wavesurfer.seekTo(0);
          this.progress = 0;
          this.ref.markForCheck();
        });
        this.wavesurfer.on('audioprocess', () => {
          this.progress = this.wavesurfer.getCurrentTime() / this.wavesurfer.getDuration() * 100;
          this.ref.markForCheck();
        });
        if (this.url) {
          this.wavesurfer?.load(this.url);
        }
      });
    }

    playPause() {
      if (this.wavesurfer && this.wavesurfer.isReady) {
        this.wavesurfer.playPause();
      }
    }
}
