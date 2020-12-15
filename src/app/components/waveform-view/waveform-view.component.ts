import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AudioSelection, DownloadLink, FileInfo } from 'src/app/models/models';
import * as WaveSurfer from 'wavesurfer.js';
import WaveSurferRegions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.spectrogram.min.js';
import { getSpectrum } from './fft';

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
  public selection!: AudioSelection;
  private duration = 0.0;

  public downloadLink: DownloadLink | undefined = undefined;

  // tslint:disable-next-line:variable-name
  private _url = '';
  private _id = '';
  @Input()
  set file(file: FileInfo) {
    this._id = file.id;
    this._url = file.url;
    if (this._url) {
      this.wavesurfer?.load(this._url);
    }
  }

  @Input() waveColor = '#3c3';
  @Input() progressColor = '#3ad';
  @Input() cursorColor = '#ccc';

  @ViewChild('wavesurfer') private ws!: ElementRef;
  @ViewChild('spectrum') private spectrum!: ElementRef;

  constructor(private ref: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.wavesurfer = WaveSurfer.create({
        container: this.ws.nativeElement,
        waveColor: this.waveColor,
        progressColor: this.progressColor,
        cursorColor: this.cursorColor,
        height: 60,
        normalize: true,
        plugins: [
          WaveSurferRegions.create({
          }),
          SpectrogramPlugin.create({
            container: this.spectrum.nativeElement,
            fftSamples: 256
          }),
        ]
      });
      this.wavesurfer.on('ready', () => {
        this.duration = this.wavesurfer.getDuration();
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
      this.wavesurfer.on('region-update-end', async (region: any) => {
        if (this.region && this.region.id !== region.id) {
          this.region.remove();
        } else {
          this.region = region;
        }
        this.selection = new AudioSelection(region.start, region.end); // Can be saved for later trimming
        const normalizedStartPos = this.selection.start / this.duration;
        const normalizedEndPos = this.selection.end / this.duration;
        const buffer = (this.wavesurfer.backend as any).buffer;

        const spectrum = await getSpectrum(buffer, 256, normalizedStartPos, normalizedEndPos);

        const ctx: CanvasRenderingContext2D = this.spectrum.nativeElement.querySelector('canvas').getContext('2d');
        const backCanvas: HTMLCanvasElement = document.createElement('canvas');
        backCanvas.width = spectrum.length;
        backCanvas.height = spectrum[0].length;
        const backCtx: CanvasRenderingContext2D = backCanvas.getContext('2d') as CanvasRenderingContext2D;

        for (let i = 0; i < spectrum.length; i++) {
          const h = spectrum[i].length;
          for (let j = 0; j < h; j++) {
            const c = spectrum[i][j];
            backCtx.fillStyle = `rgb(${c}, ${c}, ${c})`;
            backCtx.fillRect(i, h - j - 1, 1, 1);
          }
        }

        this.downloadLink = new DownloadLink(`${this._id}.png`, backCanvas.toDataURL());
      });
      this.wavesurfer.enableDragSelection({});
      if (this._url) {
        this.wavesurfer?.load(this._url);
      }
    });
  }

  playPause(): void {
    if (this.wavesurfer && this.wavesurfer.isReady) {
      if (!this.wavesurfer.isPlaying()) {
        if (this.region) {
          const seekPos = this.region.start / this.wavesurfer.getDuration();
          this.wavesurfer.seekTo(seekPos);
        }
      }

      this.wavesurfer.playPause();
    }
  }
}
