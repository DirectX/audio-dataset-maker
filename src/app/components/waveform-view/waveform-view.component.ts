import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AudioSelection } from 'src/app/models/models';
import * as WaveSurfer from 'wavesurfer.js';
import * as WaveSurferRegions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';

@Component({
  selector: 'app-waveform-view',
  templateUrl: './waveform-view.component.html',
  styleUrls: ['./waveform-view.component.scss']
})
export class WaveformViewComponent implements AfterViewInit {
  public progress = 0;
  public playing = false;
  private wavesurfer!: WaveSurfer;
  private region: any = null;
  private selection!: AudioSelection;

  // tslint:disable-next-line:variable-name
  private _url = '';
  @Input()
  set url(url: string) {
    this._url = url;
    if (this.url) {
      this.wavesurfer?.load(this.url);
    }
  }
  get url(): string {
    return this._url;
  }

  @Input() waveColor = '#3c3';
  @Input() progressColor = '#3ad';
  @Input() cursorColor = '#ccc';

  @ViewChild('wavesurfer') private ws!: ElementRef;

  constructor(private ref: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      this.wavesurfer = WaveSurfer.create({
        container: this.ws.nativeElement,
        waveColor: this.waveColor,
        progressColor: this.progressColor,
        cursorColor: this.cursorColor,
        height: 60,
        plugins: [
          WaveSurferRegions.create({
            // regions: [
            //   {
            //     start: 1,
            //     end: 3,
            //     color: 'hsla(400, 100%, 30%, 0.5)'
            //   }, {
            //     start: 5,
            //     end: 7,
            //     color: 'hsla(200, 50%, 70%, 0.4)'
            //   }
            // ]
          })
        ]
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
      this.wavesurfer.on('region-created', (region: any) => {
        if (this.region) {
          this.region.remove();
        }
        this.region = region;
      });
      this.wavesurfer.on('region-update-end', (region: any) => {
        if (this.region && this.region.id !== region.id) {
          this.region.remove();
        } else {
          this.region = region;
        }
        this.selection = new AudioSelection(region.start, region.end);
      });
      this.wavesurfer.enableDragSelection({});
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
