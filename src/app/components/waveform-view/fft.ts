
import { fft, util as fftUtil } from 'fft-js';

export async function getSpectrum(buffer: any,
                                  fftSamples: number,
                                  normalizedStartPos: number,
                                  normalizedEndPos: number): Promise<Array<Uint8Array>> {
  return new Promise<Array<Uint8Array>>((resolve, reject) => {
    const frequencies = Array<Uint8Array>();
    const channelOne = buffer.getChannelData(0);
    const bufferLength = buffer.length;
    const sampleRate = buffer.sampleRate;

    if (!buffer) {
      reject('Web Audio buffer is not available');
      return;
    }

    let currentOffset = normalizedStartPos * channelOne.length;
    const endIndex = normalizedEndPos * channelOne.length;

    while (currentOffset + fftSamples < channelOne.length) {
      const segment = channelOne.slice(currentOffset, currentOffset + fftSamples);
      const spectrum = fft(segment);
      const magnitudes = fftUtil.fftMag(spectrum);
      const array = new Uint8Array(fftSamples / 2);
      const j = void 0;

      for (let j = 0; j < fftSamples / 2; j++) {
        array[j] = magnitudes[j] * 255;
      }

      frequencies.push(array);
      currentOffset += fftSamples;

      if (currentOffset > endIndex) {
        break;
      }
    }

    resolve(frequencies);
  });
}
