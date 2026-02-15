import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.model';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  Subscription,
  switchMap,
} from 'rxjs';
import { ApiService } from '../../shared/services/api.service';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invite-members',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatChipsModule,
    MatIcon,
    MatAutocompleteModule,
  ],
  templateUrl: './invite-members.component.html',
  styleUrl: './invite-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteMembersComponent implements OnDestroy {
  constructor(
    private api: ApiService,
    private workspaceService: WorkspaceService,
    public dialogRef: MatDialogRef<any>,
    private announcer: LiveAnnouncer,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  maxMembers!: number;
  separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;
  members: User[] = [];
  filteredUsers: User[] = [];
  workspaceId!: string;
  subscription!: Subscription;
  subscription2!: Subscription;

  userCtrl = new FormControl('');

  ngOnInit() {
    this.userCtrl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        filter(
          (value): value is string =>
            typeof value === 'string' && value.length > 1,
        ),
        switchMap((value) => this.api.searchUsers(value, this.workspaceId)),
      )
      .subscribe((res) => {
        this.filteredUsers = res.users;
      });

    this.subscription =
      this.workspaceService.workspaceMembersRemainingNumber.subscribe((res) => {
        this.maxMembers = res;
      });
    this.subscription2 = this.workspaceService.workspaceId.subscribe((res) => {
      this.workspaceId = res!;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }

  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (!value) return;

    const user = this.filteredUsers.find(
      (u) => u.username.toLowerCase() === value.toLowerCase(),
    );

    if (user) {
      this.addUser(user);
    }

    event.chipInput!.clear();
    this.userCtrl.setValue('');
  }

  selected(event: MatAutocompleteSelectedEvent) {
    this.addUser(event.option.value);
    this.userCtrl.setValue('');
  }

  private addUser(user: User) {
    if (this.members.length >= this.maxMembers) {
      this.announcer.announce('Workspace is full');
      return;
    }

    if (this.members.some((u) => u._id === user._id)) {
      return;
    }

    const members = [...this.members, user];
    this.members = members;
    this.userCtrl.setValue('');
  }

  remove(user: User) {
    const members = this.members.filter((u) => u._id !== user._id);
    this.members = members;

    this.announcer.announce(`${user.username} removed`);
  }

  onSubmit() {
    if (!this.members.length) {
      return;
    }

    const allAddedMembers = {
      users: this.members.reduce<Record<string, User>>((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {}),
    };

    this.api
      .inviteWorkspaceMembers(allAddedMembers, this.workspaceId)
      .subscribe((res) => {
        this.close();
        this.snackBar.open('Invite sent', 'Close', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      });
  }

  copyInviteLink() {
    this.api.createInviteWithLink(this.workspaceId).subscribe((res) => {
      navigator.clipboard.writeText(res.inviteLink);
      this.snackBar.open('Invite link copied', 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    });
  }

  close() {
    this.dialogRef.close();
  }
}
