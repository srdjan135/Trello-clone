import { Component } from '@angular/core';
import { MatList, MatListItemTitle } from '@angular/material/list';
import { MatListItem } from '@angular/material/list';
import { MatListItemIcon } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatDivider } from '@angular/material/divider';
import { templates } from './templates';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Workspace } from '../models/workspace';
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
})
export class SidenavComponent {
  boardTemplates: string[] = templates;
  workspaces: Workspace[] = [];
}
