import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { User } from '../models/user.model';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';

import { ModalComponent } from '../shared/components/modal/modal.component';
import { CreateWorkspaceComponent } from '../workspaces/create-workspace/create-workspace.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Notification } from '../models/notification';
import { ClickStopPropagationDirective } from '../shared/directives/click-stop-propagation.directive';
import { MatBadge } from '@angular/material/badge';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIcon,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatButton,
    MatIconButton,
    MatInput,
    MatToolbar,
    MatTooltip,
    MatMenuModule,
    MatDivider,
    RouterLink,
    RouterLinkActive,
    ClickStopPropagationDirective,
    MatBadge,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  user!: User;
  userInitial!: string;
  notifications: Notification[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private api: ApiService,
    private auth: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.api.getUser().subscribe((res) => {
      this.user = res.user;
      this.userInitial = this.user.username.split('')[0];
      this.cdr.markForCheck();
    });
    this.api.getNotifications().subscribe((res) => {
      this.notifications = res.notifications;
      this.cdr.markForCheck();
    });
  }

  openFormModal() {
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

  logout() {
    this.auth.logout();
  }

  get unreadNotifications() {
    return this.notifications.filter((n) => !n.read).length;
  }

  readNotifications() {
    this.api.readNotifications(this.user._id).subscribe(() => {
      this.notifications = this.notifications.map((n) => ({
        ...n,
        read: true,
      }));

      this.cdr.markForCheck();
    });
  }

  declineInvite(notificationId: string, workspaceId: string | undefined) {
    this.api
      .declineInviteToWorkspace(notificationId, workspaceId)
      .subscribe(() => {
        this.notifications = this.notifications.filter(
          (n) => n._id !== notificationId,
        );
        this.cdr.markForCheck();
      });
  }

  acceptInvite(notificationId: string, workspaceId: string | undefined) {
    this.api
      .acceptInviteToWorkspace(this.user._id, workspaceId, notificationId)
      .subscribe(() => {
        this.notifications = this.notifications.filter(
          (n) => n._id !== notificationId,
        );
        this.cdr.markForCheck();
      });
  }

  deleteNotification(notificationId: string) {
    this.api.deleteNotification(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(
        (n) => n._id !== notificationId,
      );
      this.cdr.markForCheck();
    });
  }
}
