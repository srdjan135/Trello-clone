import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { BoardsComponent } from '../boards/boards.component';
import {
  MatFormField,
  MatLabel,
  MatPrefix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { ApiService } from '../../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Workspace } from '../../../models/workspace';
import { map, switchMap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceService } from '../../../shared/services/workspace.service';

@Component({
  selector: 'app-workspace-boards',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatIcon,
    MatPrefix,
    BoardsComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './workspace-boards.component.html',
  styleUrl: './workspace-boards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceBoardsComponent implements OnInit {
  sortControl = new FormControl<'az' | 'za'>('az');
  searchControl = new FormControl('');
  workspaceId!: string;
  workspace!: Workspace;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.workspaceId = params.get('workspaceId')!;
          return this.api.getWorkspaces();
        }),
        map((res) => res.workspaces.find((w) => w._id === this.workspaceId)),
      )
      .subscribe((workspace) => {
        this.workspace = workspace!;
        this.workspaceService.setWorkspaceId(this.workspaceId);
        this.cdr.markForCheck();
      });
  }
}
