import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
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
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Notification } from '../models/notification';
import { ClickStopPropagationDirective } from '../shared/directives/click-stop-propagation.directive';
import { MatBadge } from '@angular/material/badge';
import { MatRadioModule } from '@angular/material/radio';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedService } from '../shared/services/shared.service';
import { Board } from '../models/board.model';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { debounceTime, switchMap, of, distinctUntilChanged } from 'rxjs';
import { AvatarComponent } from '../shared/components/avatar/avatar.component';
import { Workspace } from '../models/workspace';

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
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
    AvatarComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  user!: User;
  userInitial!: string;
  notifications: Notification[] = [];
  selectedTheme = 'light';
  searchControl = new FormControl('');
  filteredBoards: Board[] = [];
  workspaces!: Workspace[];

  @ViewChild(MatAutocompleteTrigger) autoTrigger!: MatAutocompleteTrigger;

  constructor(
    private cdr: ChangeDetectorRef,
    private api: ApiService,
    private auth: AuthService,
    private sharedService: SharedService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('Theme') || 'light';
    this.selectedTheme = savedTheme;
    this.applyTheme(savedTheme);
    this.api.getUser().subscribe((res) => {
      this.user = res.user;
      this.userInitial = this.user.username.split('')[0];
      this.cdr.markForCheck();
    });
    this.api.getNotifications().subscribe((res) => {
      this.notifications = res.notifications;
      this.cdr.markForCheck();
    });
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          if (!value || value.length < 1) {
            return of({ boards: [] });
          }
          return this.api.searchBoards(value || '');
        }),
      )
      .subscribe((res) => {
        this.filteredBoards = res.boards;
        if (!this.autoTrigger.panelOpen) {
          this.autoTrigger.openPanel();
        }
      });
    this.api.getWorkspaces().subscribe((res) => {
      this.workspaces = res.workspaces;
      this.cdr.markForCheck();
    });
  }

  getWorkspaceName(board: Board): string {
    if (typeof board.workspace === 'string') {
      const found = this.workspaces.find((w) => w._id === board.workspace);
      return found?.name ?? '';
    }

    return board.workspace.name;
  }

  openFormModal() {
    this.sharedService.openCreateWorkspaceModal();
  }

  openBoard(board: Board) {
    this.router.navigate(['/boards', board._id]);
    this.searchControl.setValue('');
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

  declineInvite(notificationId: string) {
    this.api.declineInvite(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(
        (n) => n._id !== notificationId,
      );
      this.cdr.markForCheck();
    });
  }

  acceptInvite(notificationId: string) {
    this.api.acceptInvite(notificationId).subscribe(() => {
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

  applyTheme(value: string) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${value}-theme`);
    localStorage.setItem('Theme', value);
  }
}
