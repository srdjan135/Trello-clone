import { CommonModule } from '@angular/common';
import { Component, Inject, Type } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

export interface DynamicModalData {
  title?: string;
  subtitle?: string;
  component: Type<any>;
  data?: any;
}

@Component({
  selector: 'app-dynamic-dialog',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  standalone: true,
  imports: [CommonModule, MatDialogContent, MatIcon, MatIconButton],
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DynamicModalData,
  ) {}

  close() {
    this.dialogRef.close();
  }
}
