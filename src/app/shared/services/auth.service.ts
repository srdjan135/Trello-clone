import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated = false;
  private token!: string;
  private tokenTimer: any;

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

  signUp(userData: FormData) {
    return this.api.signUp(userData).pipe(
      switchMap((res) => {
        if (res.token) {
          this.handleAuth(res.token, res.expiresIn!);
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
      tap((res) => this.handleAuth(res.token, res.expiresIn)),
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

  private handleAuth(token: string, expiresIn: number) {
    this.token = token;
    this.isAuthenticated = true;
    const now = new Date();
    const expirationDate = new Date(now.getTime() + expiresIn * 1000);
    this.setAuthTime(expiresIn);
    this.saveAuthData(token, expirationDate);
    this.router.navigate(['/']);
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
