import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InviteMembersComponent } from '../../workspaces/invite-members/invite-members.component';
import { ModalComponent } from '../components/modal/modal.component';
import { CreateWorkspaceComponent } from '../../workspaces/create-workspace/create-workspace.component';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(private dialog: MatDialog) {}

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

  openCreateWorkspaceModal() {
    this.dialog.open(ModalComponent, {
      width: '70%',
      maxWidth: '100vw',
      height: '60%',
      data: {
        title: 'Create Workspace',
        subtitle:
          'Boost your productivity by making it easier for everyone to access boards in one location',
        component: CreateWorkspaceComponent,
      },
    });
  }
}
