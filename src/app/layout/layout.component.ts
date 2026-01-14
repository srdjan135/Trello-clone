import { Component } from '@angular/core';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavContent } from '@angular/material/sidenav';

import { SidenavComponent } from '../sidenav/sidenav.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    SidenavComponent,
    RouterOutlet,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {}
