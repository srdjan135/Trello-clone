import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { MatList, MatListItemTitle } from '@angular/material/list';
import { MatListItem } from '@angular/material/list';
import { MatListItemIcon } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatDivider } from '@angular/material/divider';
import { templates } from './templates';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Workspace } from '../models/workspace';
import { filter, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkspaceService } from '../shared/services/workspace.service';
import { ApiService } from '../shared/services/api.service';
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    MatList,
    MatListItem,
    MatListItemIcon,
    MatListItemTitle,
    MatIcon,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatDivider,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements OnInit {
  boardTemplates: string[] = templates;
  workspaces: Workspace[] = [];
  workspaceId!: string;
  isAdmin!: boolean;

  constructor(
    private workspaceService: WorkspaceService,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.workspaceService.workspaceId
      .pipe(
        filter((id): id is string => !!id),
        tap((id) => (this.workspaceId = id)),
        switchMap((id) => this.api.getMyRole(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.isAdmin = res.role === 'admin';
        this.cdr.markForCheck();
      });

    this.workspaceService
      .getWorkspaces()
      .pipe(
        switchMap(() => this.workspaceService.workspaces),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.workspaces = res;
        this.cdr.markForCheck();
      });
  }

  isWorkspaceActive(workspaceId: string) {
    return this.router.url.includes(`${workspaceId}`);
  }
}
