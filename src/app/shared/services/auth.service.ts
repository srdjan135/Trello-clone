import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token!: string;

  constructor(private api: ApiService) {}

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

  private handleAuth(token: string, expiresIn: number) {
    this.token = token;
    const now = new Date();
    const expirationDate = new Date(now.getDate() + expiresIn * 1000);
  }
}
