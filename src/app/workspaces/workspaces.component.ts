import { Component } from '@angular/core';
import { Workspace } from '../models/workspace';
import { WorkspaceComponent } from './workspace/workspace.component';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [WorkspaceComponent],
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.scss',
})
export class WorkspacesComponent {
  workspaces: Workspace[] = [];

  constructor() {}
}
