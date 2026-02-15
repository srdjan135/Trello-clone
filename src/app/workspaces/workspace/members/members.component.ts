import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Workspace } from '../../../models/workspace';
import { ApiService } from '../../../shared/services/api.service';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { MatList, MatListItem, MatListItemTitle } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { User } from '../../../models/user.model';
import { SharedService } from '../../../shared/services/shared.service';
import { WorkspaceService } from '../../../shared/services/workspace.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceMember } from '../../../models/workspaceMember';
import { MatTooltip } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { Board } from '../../../models/board.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    MatList,
    MatListItem,
    MatListItemTitle,
    MatDivider,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButton,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatMenuModule,
    MatIconButton,
    MatTooltip,
    ReactiveFormsModule,
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
})
export class MembersComponent implements OnInit {
  workspaceId!: string;
  workspace!: Workspace;
  workspaceMembers!: WorkspaceMember[];
  filteredWorkspaceMembers: WorkspaceMember[] = [];
  currentUser!: User;
  currentMember!: WorkspaceMember;
  boards!: Board[];
  searchWorkspaceMembersByName = new FormControl('');

  constructor(
    private api: ApiService,
    private sharedService: SharedService,
    private workspaceService: WorkspaceService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const workspaceId$ = this.route.paramMap.pipe(
      map((params) => params.get('workspaceId')!),
      tap((id) => (this.workspaceId = id)),
    );

    const search$ = this.searchWorkspaceMembersByName.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map((value) => (value ?? '').toLowerCase().trim()),
    );

    workspaceId$
      .pipe(
        switchMap((workspaceId) =>
          combineLatest([
            this.api.getWorkspaces(),
            this.api.getWorkspaceMembers(workspaceId),
            this.api.getBoards(workspaceId),
            this.api.getUser(),
            search$,
          ]).pipe(
            map(([workspacesRes, members, boardsRes, userRes, search]) => ({
              workspace: workspacesRes.workspaces.find(
                (w) => w._id === workspaceId,
              )!,
              members,
              boards: boardsRes.boards,
              user: userRes.user,
              search,
            })),
          ),
        ),
      )
      .subscribe((data) => {
        this.workspace = data.workspace;
        this.workspaceMembers = data.members;
        this.boards = data.boards;
        this.currentUser = data.user;

        this.currentMember = data.members.find(
          (m) => m.user._id === data.user._id,
        )!;

        this.filteredWorkspaceMembers = data.members.filter((m) =>
          m.user.username.toLowerCase().includes(data.search.toLowerCase()),
        );

        this.workspaceService.setWorkspaceId(this.workspaceId);
        this.workspaceService.workspaceMembersRemainingNumber = of(
          10 - this.workspace.members.length,
        );

        this.cdr.markForCheck();
      });
  }

  get isAdmin() {
    return this.currentMember?.role === 'admin';
  }

  inviteModal() {
    this.sharedService.openInviteModal();
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

  setWorkspaceMemberRole(member: WorkspaceMember, role: 'admin' | 'member') {
    this.api.setWorkspaceMemberRole(member, role).subscribe(() => {
      const updateMemberRole = this.workspaceMembers.find(
        (m) => m._id === member._id,
      )!;
      updateMemberRole.role = role;
      this.cdr.markForCheck();
    });
  }

  removeMemberFromWorkspace(member: WorkspaceMember) {
    this.api.removeWorkspaceMember(member, this.workspaceId).subscribe(() => {
      this.filteredWorkspaceMembers = this.filteredWorkspaceMembers.filter(
        (m) => m._id !== member._id,
      );
      this.cdr.markForCheck();
    });
  }

  private search() {
    const searchValue =
      this.searchWorkspaceMembersByName.value?.toLowerCase().trim() ?? '';

    this.filteredWorkspaceMembers = this.workspaceMembers.filter((m) =>
      m.user.username.toLowerCase().includes(searchValue),
    );

    this.cdr.markForCheck();
  }
}
