import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { AuthService, StoredAccount } from '../shared/services/auth.service';
import { RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { User } from '../models/user.model';
import { ApiService } from '../shared/services/api.service';

@Component({
  selector: 'app-switch-accounts',
  standalone: true,
  imports: [
    RouterLink,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatProgressSpinner,
  ],
  templateUrl: './switch-accounts.component.html',
  styleUrl: './switch-accounts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchAccountsComponent implements OnInit {
  accounts: StoredAccount[] = [];
  isLoading!: boolean;
  currentUser!: User;

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.accounts = this.authService.getStoredAccounts();
    this.isLoading = false;
    this.api.getUser().subscribe((res) => {
      this.currentUser = res.user;
      this.cdr.markForCheck();
    });
  }

  switch(account: StoredAccount) {
    this.authService.switchAccount(account);
    this.snackBar.open(`Switched to ${account.username} account!`, 'Close', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  remove(account: StoredAccount) {
    this.authService.removeAccount(account.userId);
    this.accounts = this.authService.getStoredAccounts();
  }
}
