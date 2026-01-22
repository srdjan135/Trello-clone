import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Workspace } from '../models/workspace';
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

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.getWorkspaces().subscribe((res) => {
      this.workspaces = res.workspaces;
      this.cdr.markForCheck();
    });
  }
}
