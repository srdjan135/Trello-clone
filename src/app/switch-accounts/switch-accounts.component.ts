import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService, StoredAccount } from '../shared/services/auth.service';
import { RouterLink } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-switch-accounts',
  standalone: true,
  imports: [RouterLink, MatButton, MatIconButton, MatIcon, MatTooltip],
  templateUrl: './switch-accounts.component.html',
  styleUrl: './switch-accounts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchAccountsComponent implements OnInit {
  accounts: StoredAccount[] = [];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.accounts = this.authService.getStoredAccounts();
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
