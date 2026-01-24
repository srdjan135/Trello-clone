import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-invite-members',
  standalone: true,
  imports: [FormsModule, MatButton, MatFormField, MatLabel, MatInput, MatIcon],
  templateUrl: './invite-members.component.html',
  styleUrl: './invite-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteMembersComponent {
  constructor(public dialogRef: MatDialogRef<ModalComponent>) {}

  onSubmit(form: NgForm) {}

  close() {
    this.dialogRef.close();
  }
}
