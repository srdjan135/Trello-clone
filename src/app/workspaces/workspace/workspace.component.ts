import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Workspace } from '../../models/workspace';
import { BoardsComponent } from './boards/boards.component';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [MatButton, MatIcon, BoardsComponent, RouterLink, RouterLinkActive],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent {
  @Input({ required: true }) workspace!: Workspace;
}
