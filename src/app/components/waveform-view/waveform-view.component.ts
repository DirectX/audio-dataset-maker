import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-waveform-view',
  templateUrl: './waveform-view.component.html',
  styleUrls: ['./waveform-view.component.scss']
})
export class WaveformViewComponent implements AfterViewInit {
    private wavesurfer: WaveSurfer;
    @Input() url: string = '';
    @ViewChild('wavesurfer') ws: ElementRef;
    @Input() waveColor = '#0F0';
    @Input() progressColor = '#00F';
    @Input() cursorColor = '#CCC';
    progress = 0;
    playing = false;

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
          height: 40
        });
        this.wavesurfer.load(this.url);
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
      });
    }


    playPause() {
      if (this.wavesurfer && this.wavesurfer.isReady) {
        this.wavesurfer.playPause();
      }
    }
}
