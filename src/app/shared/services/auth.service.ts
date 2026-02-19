import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

export interface StoredAccount {
  userId: string;
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated = false;
  private token!: string;
  private tokenTimer: any;
  private ACCOUNTS_KEY = 'accounts';
  private ACTIVE_ACCOUNT_KEY = 'activeAccount';

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getStoredAccounts(): StoredAccount[] {
    return JSON.parse(localStorage.getItem(this.ACCOUNTS_KEY) || '[]');
  }

  signUp(userData: FormData) {
    return this.api.signUp(userData).pipe(
      switchMap((res) => {
        if (res.token) {
          this.handleAuth(res.token, res.expiresIn!, res.user!);
          return of(res.user);
        }

        const loginData = new FormData();
        loginData.append('email', userData.get('email') as string);
        loginData.append('password', userData.get('password') as string);
        return this.signIn(loginData);
      }),
    );
  }

  signIn(userData: FormData) {
    return this.api.signIn(userData).pipe(
      tap((res) => this.handleAuth(res.token, res.expiresIn, res.user!)),
      map((res) => res.user!),
    );
  }

  logout() {
    ((this.token = ''), (this.isAuthenticated = false));
    this.router.navigate(['/signin']);
    this.clearAuthData();
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();

    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTime(expiresIn / 1000);
    }
  }

  saveAccount(account: StoredAccount) {
    const accounts = this.getStoredAccounts();

    const exists = accounts.find((a) => a.userId === account.userId);
    if (!exists) {
      accounts.push(account);
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    localStorage.setItem(this.ACTIVE_ACCOUNT_KEY, JSON.stringify(account));
  }

  switchAccount(account: StoredAccount) {
    localStorage.setItem(this.ACTIVE_ACCOUNT_KEY, JSON.stringify(account));
    localStorage.setItem('token', account.token);

    sessionStorage.setItem(
      'switchMessage',
      `Switched to ${account.username} account!`,
    );

    window.location.href = '/boards';
  }

  removeAccount(userId: string) {
    const accounts = this.getStoredAccounts().filter(
      (a) => a.userId !== userId,
    );
    localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  private handleAuth(token: string, expiresIn: number, user: User) {
    this.token = token;
    this.isAuthenticated = true;
    const now = new Date();
    const expirationDate = new Date(now.getTime() + expiresIn * 1000);
    this.setAuthTime(expiresIn);
    this.saveAuthData(token, expirationDate);
    this.router.navigate(['/']);
    const account: StoredAccount = {
      userId: user._id,
      username: user.username,
      email: user.email,
      token: token,
    };
    this.saveAccount(account);
  }

  private setAuthTime(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('Theme');
    localStorage.removeItem(this.ACCOUNTS_KEY);
    localStorage.removeItem(this.ACTIVE_ACCOUNT_KEY);
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');

    if (!token || !expirationDate) {
      return null;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
    };
  }
}
