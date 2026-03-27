import { CommonModule } from '@angular/common';
import { Component, Inject, Type } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { EditCardComponent } from '../../../workspaces/workspace/boards/board/board-columns/board-column/cards/card/edit-card/edit-card.component';

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
  EditCardComponent = EditCardComponent;
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DynamicModalData,
  ) {}

  close() {
    this.dialogRef.close();
  }
}
