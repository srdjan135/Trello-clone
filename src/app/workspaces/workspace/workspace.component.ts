import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Workspace } from '../../models/workspace';
import { BoardsComponent } from './boards/boards.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { WorkspaceService } from '../../shared/services/workspace.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [MatButton, MatIcon, BoardsComponent, RouterLink, RouterLinkActive],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent implements OnInit {
  @Input({ required: true }) workspace!: Workspace;
  isAdmin!: boolean;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private workspaceService: WorkspaceService,
  ) {}

  ngOnInit(): void {
    this.workspaceService.setWorkspaceId(this.workspace._id);
    if (this.workspace) {
      this.api.getMyRole(this.workspace._id).subscribe((res) => {
        this.isAdmin = res.role === 'admin';
        this.cdr.markForCheck();
      });
    }
  }
}
