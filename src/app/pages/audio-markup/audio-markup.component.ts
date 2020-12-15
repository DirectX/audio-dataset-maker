import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { DialogData, FileInfo } from 'src/app/models/models';

@Component({
  selector: 'app-audio-markup',
  templateUrl: './audio-markup.component.html',
  styleUrls: ['./audio-markup.component.scss']
})
export class AudioMarkupComponent implements OnInit {
  catalogUrl!: string;
  files: FileInfo[] = [];
  displayFiles: FileInfo[] = [];

  public pageSize = 5;
  public pageIndex = 0;

  get pageCount(): number {
    return Math.ceil(this.files.length / this.pageSize);
  }

  constructor(
    public dialog: MatDialog,
    private http: HttpClient) {}

  ngOnInit(): void {
    this.catalogUrl = localStorage.getItem('catalogUrl') || '';
    this.loadCatalog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LoadCatalogDialogComponent, {
      width: '250px',
      data: { catalogUrl: this.catalogUrl }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.catalogUrl = result;
        localStorage.setItem('catalogUrl', this.catalogUrl);
        this.loadCatalog();
      }
    });
  }

  loadCatalog(): void {
    if (this.catalogUrl) {
      this.files = [];
      this.http.get<string>(`${this.catalogUrl}/index.txt`, { responseType: 'text' as 'json' }).subscribe((res: string) => {
        if (res && res.length) {
          const lines = res.split('\n');

          for (const line of lines) {
            const filename = line.substr(2);
            const id = filename.split('_')[0];

            this.files.push({
              id,
              url: `${this.catalogUrl}/${filename}`
            } as FileInfo);
          }

          this.files = this.files.filter(file => file.id).sort((a, b) => a.id.localeCompare(b.id));
          
          this.filterFiles();
        }
      }, err => console.log(err) );
    }
  }

  onPageChanged($event: PageEvent): void {
    this.pageIndex = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.filterFiles();
  }

  filterFiles(): void {
    this.displayFiles = this.files.slice((this.pageIndex) * this.pageSize, (this.pageIndex + 1) * this.pageSize);
  }
}

@Component({
  selector: 'load-catalog-dialog',
  template: `
  <h1 mat-dialog-title>Catalog URL</h1>
  <div mat-dialog-content>
    <p>Catalog URL with the list of wav.* files</p>
    <mat-form-field>
      <mat-label>URL</mat-label>
      <input matInput [(ngModel)]="data.catalogUrl" placeholder="https://example.com" (keyup.enter)="onSave()" cdkFocusInitial>
    </mat-form-field>
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="onCancel()">Cancel</button>
    <button mat-button [mat-dialog-close]="data.catalogUrl">Save</button>
  </div>`,
})
export class LoadCatalogDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LoadCatalogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onSave(): void {
    this.dialogRef.close(this.data.catalogUrl);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}