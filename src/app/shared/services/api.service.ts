import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { Workspace } from '../../models/workspace';
import { Board } from '../../models/board.model';
import { Notification } from '../../models/notification';
import { WorkspaceMember } from '../../models/workspaceMember';
import { BoardMember } from '../../models/boardMember';
import { Column } from '../../models/column.model';
import { Card } from '../../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signUp(userData: FormData) {
    return this.http.post<{
      token: string;
      expiresIn: number;
      user: User;
    }>(`${this.API_URL}/signup`, userData);
  }

  signIn(userData: FormData) {
    return this.http.post<{
      token: string;
      expiresIn: number;
      user: User;
    }>(`${this.API_URL}/signin`, userData);
  }

  getUser() {
    return this.http.get<{ user: User }>(`${this.API_URL}/user`);
  }

  manageUser(data: { username: string; email: string }, userId: string) {
    return this.http.put(`${this.API_URL}/user/${userId}`, data);
  }

  searchUsers(
    q: string,
    workspaceId?: string,
    type?: 'workspace' | 'board',
    boardId?: string,
  ) {
    let params: any = { q };

    if (workspaceId) params.workspaceId = workspaceId;
    if (workspaceId) params.type = type;
    if (boardId) params.boardId = boardId;

    return this.http.get<{ users: User[] }>(`${this.API_URL}/users/search`, {
      params,
    });
  }

  deleteAccount() {
    return this.http.delete(`${this.API_URL}/users/user/delete`);
  }

  getNotifications() {
    return this.http.get<{ notifications: Notification[] }>(
      `${this.API_URL}/notifications`,
    );
  }

  deleteNotification(notificationId: string) {
    return this.http.delete(`${this.API_URL}/notifications/${notificationId}`);
  }

  readNotifications(userId: string) {
    return this.http.put(`${this.API_URL}/${userId}/notifications`, {});
  }

  getWorkspaces() {
    return this.http.get<{ workspaces: Workspace[] }>(
      `${this.API_URL}/workspaces`,
    );
  }

  gePopulateWorkspaces() {
    return this.http.get<{ workspaces: Workspace[] }>(
      `${this.API_URL}/workspaces/populate`,
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
    return this.http.put<{ boards: Board[] }>(
      `${this.API_URL}/workspaceMembers/${member._id}`,
      {
        member,
        role,
      },
    );
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

  acceptInvite(notificationId: string) {
    return this.http.post<{ workspace: Workspace }>(
      `${this.API_URL}/notifications/accept`,
      {
        notificationId,
      },
    );
  }

  declineInvite(notificationId: string) {
    return this.http.post(`${this.API_URL}/notifications/decline`, {
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

  getBoard(boardId: string) {
    return this.http.get<{ board: Board }>(`${this.API_URL}/boards/${boardId}`);
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

  searchBoards(query: string) {
    return this.http.get<{ boards: Board[] }>(`${this.API_URL}/boards/search`, {
      params: {
        q: query,
      },
    });
  }

  updateBoard(boardId: string, updates: Partial<Board>) {
    return this.http.patch<{ board: Board; boardMembers: BoardMember[] }>(
      `${this.API_URL}/boards/${boardId}/update`,
      updates,
    );
  }

  inviteBoardMembers(
    allAddedMembers: { users: Record<string, User> },
    boardId: string,
  ) {
    return this.http.post(`${this.API_URL}/boards/${boardId}/invite`, {
      allAddedMembers,
    });
  }

  getBoardMembers(boardId: string) {
    return this.http.get<{ boardMembers: BoardMember[] }>(
      `${this.API_URL}/boardMembers/${boardId}`,
    );
  }

  removeBoardMember(memberId: string, boardId: string) {
    return this.http.delete<{ boardMember: BoardMember }>(
      `${this.API_URL}/boardMembers/${boardId}/${memberId}`,
    );
  }

  copyBoard(
    boardId: string,
    data: { title: string; workspace?: string; keepCards: boolean },
  ) {
    return this.http.post<{ board: Board }>(
      `${this.API_URL}/boards/${boardId}/copy`,
      data,
    );
  }

  deleteBoard(boardId: string) {
    return this.http.delete(`${this.API_URL}/boards/${boardId}/delete`);
  }

  createColumn(columnTitle: string, boardId: string) {
    return this.http.post<{ column: Column }>(
      `${this.API_URL}/${boardId}/columns`,
      { columnTitle },
    );
  }

  getColumns(boardId: string) {
    return this.http.get<{ columns: Column[] }>(
      `${this.API_URL}/${boardId}/columns`,
    );
  }

  updateColumn(columnId: string, updates: Partial<Column>) {
    return this.http.patch<{ column: Column }>(
      `${this.API_URL}/board/${columnId}`,
      { updates },
    );
  }

  copyColumn(boardId: string, columnId: string, columnTitle: string) {
    return this.http.post<{ copiedColumn: Column }>(
      `${this.API_URL}/columns/${columnId}/copy`,
      { boardId, columnTitle },
    );
  }

  moveColumn(columnId: string, boardId: string, order: number) {
    return this.http.patch<{
      sourceColumns: Column[];
      targetColumns: Column[];
    }>(`${this.API_URL}/columns/${columnId}/move`, {
      targetBoardId: boardId,
      newOrder: order,
    });
  }

  deleteColumn(columnId: string) {
    return this.http.delete<{ column: Column }>(
      `${this.API_URL}/columns/${columnId}/delete`,
    );
  }

  createCard(cardTitle: string, columnId: string) {
    return this.http.post<{ card: Card }>(`${this.API_URL}/${columnId}/cards`, {
      cardTitle,
    });
  }

  getCards(columnId: string) {
    return this.http.get<{ cards: Card[] }>(
      `${this.API_URL}/${columnId}/cards`,
    );
  }

  moveCard(columnId: string, cardId: string, order: number) {
    return this.http.patch<{ cards: Card[] }>(
      `${this.API_URL}/${cardId}/move`,
      {
        columnId,
        order,
      },
    );
  }

  sortCards(cards: Card[]) {
    return this.http.patch(`${this.API_URL}/cards/sort`, { cards });
  }

  contactSupport(data: { category: string; subject: string; message: string }) {
    return this.http.post(`${this.API_URL}/contact-support`, data);
  }
}
