import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { Workspace } from '../../models/workspace';
import { Board } from '../../models/board.model';
import { Notification } from '../../models/notification';
import { WorkspaceMember } from '../../models/workspaceMember';

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

  searchUsers(query: string, workspaceId: string) {
    return this.http.get<{ users: User[] }>(`${this.API_URL}/users/search`, {
      params: {
        q: query,
        workspaceId,
      },
    });
  }

  getNotifications() {
    return this.http.get<{ notifications: Notification[] }>(
      `${this.API_URL}/notifications`,
    );
  }

  deleteNotification(notificationId: string) {
    return this.http.delete(`${this.API_URL}/${notificationId}`);
  }

  readNotifications(userId: string) {
    return this.http.put(`${this.API_URL}/${userId}/notifications`, {});
  }

  getWorkspaces() {
    return this.http.get<{ workspaces: Workspace[] }>(
      `${this.API_URL}/workspaces`,
    );
  }

  createWorkspace(data: { name: string; description: string }) {
    return this.http.post<{ workspace: Workspace }>(
      `${this.API_URL}/workspaces`,
      data,
    );
  }

  updateWorkspace(
    formData: {
      name: string;
      description: string;
      isPrivate: boolean;
    },
    workspaceId: string,
  ) {
    return this.http.put<{ updatedWorkspace: Workspace }>(
      `${this.API_URL}/workspaces/${workspaceId}`,
      formData,
    );
  }

  deleteWorkspace(workspaceId: string) {
    return this.http.delete(`${this.API_URL}/workspaces/${workspaceId}`);
  }

  getWorkspaceMembers(workspaceId: string) {
    return this.http.get<WorkspaceMember[]>(
      `${this.API_URL}/workspaceMembers/${workspaceId}`,
    );
  }

  setWorkspaceMemberRole(member: WorkspaceMember, role: string) {
    return this.http.put(`${this.API_URL}/workspaceMembers/${member._id}`, {
      member,
      role,
    });
  }

  removeWorkspaceMember(member: WorkspaceMember, workspaceId: string) {
    return this.http.delete(`${this.API_URL}/workspaceMembers/${member._id}`, {
      params: { workspaceId },
    });
  }

  getMyRole(workspaceId: string) {
    return this.http.get<{ role: string }>(
      `${this.API_URL}/workspaces/${workspaceId}/role`,
    );
  }

  inviteWorkspaceMembers(
    allAddedMembers: { users: Record<string, User> },
    workspaceId: string,
  ) {
    return this.http.post(`${this.API_URL}/workspace/${workspaceId}/invite`, {
      allAddedMembers,
      workspaceId,
    });
  }

  acceptInviteToWorkspace(
    memberId: string,
    workspaceId: string | undefined,
    notificationId: string,
  ) {
    return this.http.post(`${this.API_URL}/workspace/${workspaceId}/accept`, {
      memberId,
      workspaceId,
      notificationId,
    });
  }

  declineInviteToWorkspace(
    notificationId: string,
    workspaceId: string | undefined,
  ) {
    return this.http.post(`${this.API_URL}/workspace/${workspaceId}/decline`, {
      notificationId,
    });
  }

  validateInviteWithLink(token: string) {
    return this.http.get<{ workspaceId: string }>(
      `${this.API_URL}/invite/${token}`,
    );
  }

  acceptInviteWithLink(token: string) {
    return this.http.post(`${this.API_URL}/invite/${token}/accept`, {});
  }

  createInviteWithLink(workspaceId: string) {
    return this.http.post<{ inviteLink: string }>(
      `${this.API_URL}/workspaces/${workspaceId}/invite`,
      {},
    );
  }

  getBoards(workspaceId: string) {
    return this.http.get<{ boards: Board[] }>(
      `${this.API_URL}/${workspaceId}/boards`,
    );
  }

  createBoard(data: {
    title: string;
    background: string;
    workspaceId: string;
  }) {
    return this.http.post<{ board: Board }>(
      `${this.API_URL}/${data.workspaceId}/boards`,
      data,
    );
  }
}
