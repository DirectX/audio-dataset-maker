export interface DialogData {
  catalogUrl: string;
}

export class FileInfo {
  constructor (
    public id: string,
    public url: string) {}
}

export class AudioSelection {
  constructor(
    public start: number,
    public end: number) { }
}

export class DownloadLink {
  constructor (
    public download: string,
    public href: string) {}
}
