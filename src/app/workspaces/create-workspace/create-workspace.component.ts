import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InviteMembersComponent } from '../invite-members/invite-members.component';
import { ApiService } from '../../shared/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceService } from '../../shared/services/workspace.service';

@Component({
  selector: 'app-create-workspace',
  standalone: true,
  imports: [FormsModule, MatFormField, MatLabel, MatInput, MatButton, MatError],
  templateUrl: './create-workspace.component.html',
  styleUrl: './create-workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateWorkspaceComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    private dialog: MatDialog,
    private api: ApiService,
    private workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
  ) {}

  onSubmit(form: NgForm) {
    this.api
      .createWorkspace({
        name: form.value.name,
        description: form.value.description,
      })
      .subscribe((res) => {
        this.workspaceService.updateWorkspacesList(res.workspace);
        this.showMessage('Workspace was created successfully!');
        this.dialogRef.close();
        this.openInviteModal();
      });
  }

  openInviteModal() {
    this.dialog.open(ModalComponent, {
      width: '60%',
      maxWidth: '100vw',
      height: '55%',
      data: {
        title: 'Invite your team',
        subtitle:
          'Invite up to 9 more people using a link or by entering their name or email.',
        component: InviteMembersComponent,
      },
    });
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
