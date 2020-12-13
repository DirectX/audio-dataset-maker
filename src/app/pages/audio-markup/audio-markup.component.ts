import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  catalogUrl: string;
}

export interface FileInfo {
  url: string;
}

@Component({
  selector: 'app-audio-markup',
  templateUrl: './audio-markup.component.html',
  styleUrls: ['./audio-markup.component.scss']
})
export class AudioMarkupComponent implements OnInit {
  catalogUrl!: string;
  files: FileInfo[] = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.catalogUrl = localStorage.getItem('catalogUrl') || '';
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(LoadCatalogDialog, {
      width: '250px',
      data: { catalogUrl: this.catalogUrl }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.catalogUrl = result;
        localStorage.setItem('catalogUrl', this.catalogUrl);
      }
    });
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
export class LoadCatalogDialog {
  constructor(
    public dialogRef: MatDialogRef<LoadCatalogDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onSave(): void {
    this.dialogRef.close(this.data.catalogUrl);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}