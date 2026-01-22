import { Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Workspace } from '../../models/workspace';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [MatButton, MatIcon],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  @Input({ required: true }) workspace!: Workspace;
}
