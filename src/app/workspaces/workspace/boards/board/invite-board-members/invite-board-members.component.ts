import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import {
  MatChip,
  MatChipGrid,
  MatChipInput,
  MatChipInputEvent,
  MatChipRemove,
  MatChipRow,
} from '@angular/material/chips';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { User } from '../../../../../models/user.model';
import { ApiService } from '../../../../../shared/services/api.service';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invite-board-members',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
    MatAutocomplete,
    MatIcon,
    FormsModule,
    MatAutocompleteTrigger,
    MatOption,
    ReactiveFormsModule,
    MatButton,
  ],
  templateUrl: './invite-board-members.component.html',
  styleUrl: './invite-board-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteBoardMembersComponent implements OnInit {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  boardMembers: User[] = [];
  filteredUsers: User[] = [];
  userCtrl = new FormControl('');
  workspaceId!: string;
  boardId!: string;

  @ViewChild('memberInput') memberInput!: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      boardId: string;
    },
    private cdr: ChangeDetectorRef,
    private api: ApiService,
    private route: ActivatedRoute,
    private dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.workspaceId = params.get('workspaceId')!;
      this.boardId = this.data.boardId;
      this.userCtrl.valueChanges
        .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          filter(
            (value): value is string =>
              typeof value === 'string' && value.length >= 1,
          ),
          switchMap((value) =>
            this.api.searchUsers(
              value,
              this.workspaceId,
              'board',
              this.boardId,
            ),
          ),
        )
        .subscribe((res) => {
          this.filteredUsers = res.users;
          this.cdr.markForCheck();
        });
    });
  }

  remove(member: User) {
    this.boardMembers = this.boardMembers.filter((m) => m._id !== member._id);
    this.cdr.markForCheck();
  }

  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (!value) return;

    const user = this.filteredUsers.find(
      (u) => u.username.toLowerCase() === value.toLowerCase(),
    );

    if (!user) {
      this.userCtrl.setValue('');
      return;
    }

    if (this.boardMembers.some((u) => u._id === user._id)) {
      return;
    }

    this.boardMembers = [...this.boardMembers, user];
    this.userCtrl.setValue('');
    this.memberInput.nativeElement.value = '';
  }

  selected(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value as User;

    if (this.boardMembers.some((u) => u._id === user._id)) {
      return;
    }

    this.boardMembers = [...this.boardMembers, user];
    this.userCtrl.setValue('');
    this.memberInput.nativeElement.value = '';
    event.option.deselect();
  }

  onSubmit() {
    if (!this.boardMembers.length) return;

    const allAddedMembers = {
      users: this.boardMembers.reduce<Record<string, User>>((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {}),
    };

    this.api.inviteBoardMembers(allAddedMembers, this.boardId).subscribe(() => {
      this.dialogRef.close();
      this.snackBar.open('Invite sent', 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    });
  }
}
