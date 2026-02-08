import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Workspace } from '../../../models/workspace';
import { ApiService } from '../../../shared/services/api.service';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import {
  combineLatest,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { MatList, MatListItem, MatListItemTitle } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { User } from '../../../models/user.model';
import { SharedService } from '../../../shared/services/shared.service';
import { WorkspaceService } from '../../../shared/services/workspace.service';

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
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
})
export class MembersComponent implements OnInit, OnDestroy {
  workspaceId!: string;
  workspace!: Workspace;
  workspaceMembers!: User[];

  constructor(
    private api: ApiService,
    private sharedService: SharedService,
    private workspaceService: WorkspaceService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.workspaceId = params.get('workspaceId')!;
          return this.api.getWorkspaces();
        }),
        map((res) => res.workspaces.find((w) => w._id === this.workspaceId)!),
      )
      .subscribe((workspace) => {
        this.workspace = workspace;
        this.workspaceService.workspaceId = of(this.workspaceId);
        this.workspaceService.workspaceMembersRemainingNumber = of(
          10 - this.workspace?.members.length,
        );
        this.cdr.markForCheck();
        console.log(this.workspace);
      });

    this.api.getWorkspaceMembers(this.workspaceId).subscribe((res) => {
      this.workspaceMembers = res.members;
      this.cdr.markForCheck();
    });
  }

  inviteModal() {
    this.sharedService.openInviteModal();
  }

  ngOnDestroy(): void {}
}
