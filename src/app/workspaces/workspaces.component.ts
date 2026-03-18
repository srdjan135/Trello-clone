import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { Workspace } from '../models/workspace';
import { WorkspaceComponent } from './workspace/workspace.component';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WorkspaceService } from '../shared/services/workspace.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [WorkspaceComponent, MatProgressSpinner],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacesComponent implements OnInit {
  workspaces: Workspace[] = [];
  isLoading!: boolean;

  constructor(
    private workspaceService: WorkspaceService,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.workspaceService
      .getWorkspaces()
      .pipe(
        switchMap(() => this.workspaceService.workspaces),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.workspaces = res;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }
}
