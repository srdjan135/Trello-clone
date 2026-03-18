import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService, StoredAccount } from '../shared/services/auth.service';
import { RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.accounts = this.authService.getStoredAccounts();
    this.isLoading = false;
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
