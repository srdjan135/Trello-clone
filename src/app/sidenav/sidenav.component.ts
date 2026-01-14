import { Component } from '@angular/core';
import { MatList, MatListItemTitle } from '@angular/material/list';
import { MatListItem } from '@angular/material/list';
import { MatListItemIcon } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatList, MatListItem, MatListItemIcon, MatListItemTitle, MatIcon],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {}
