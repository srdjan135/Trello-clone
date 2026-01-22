import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu } from '@angular/material/menu';
import { MatMenuItem } from '@angular/material/menu';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { User } from '../models/user.model';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIcon,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatButton,
    MatIconButton,
    MatInput,
    MatToolbar,
    MatTooltip,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  user!: User;
  userInitial!: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private api: ApiService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.api.getUser().subscribe((res) => {
      this.user = res.user;
      this.userInitial = this.user.username.split('')[0];
      this.cdr.markForCheck();
    });
  }

  logout() {
    this.auth.logout();
  }
}
