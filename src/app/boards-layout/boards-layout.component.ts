import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-boards-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './boards-layout.component.html',
  styleUrl: './boards-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsLayoutComponent {}
