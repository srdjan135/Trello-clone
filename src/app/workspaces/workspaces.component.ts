import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Workspace } from '../models/workspace';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ApiService } from '../shared/services/api.service';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [WorkspaceComponent],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacesComponent implements OnInit {
  workspaces: Workspace[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.workspaces().subscribe((res) => {
      this.workspaces = res.workspaces;
      this.cdr.markForCheck();
    });
  }
}
