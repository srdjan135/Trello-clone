import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { Workspace } from '../../models/workspace';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signUp(userData: FormData) {
    return this.http.post<{ user: User; token?: string; expiresIn?: number }>(
      `${this.API_URL}/signup`,
      userData,
    );
  }

  signIn(userData: FormData) {
    return this.http.post<{
      token: string;
      expiresIn: number;
      user?: User;
    }>(`${this.API_URL}/signin`, userData);
  }

  getUser() {
    return this.http.get<{ user: User }>(`${this.API_URL}/user`);
  }

  getWorkspaces() {
    return this.http.get<{ workspaces: Workspace[] }>(
      `${this.API_URL}/workspaces`,
    );
  }
}
