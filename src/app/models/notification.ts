export interface Notification {
  _id: string;
  senderId: string;
  recipientId: string;
  type: 'WORKSPACE_INVITE' | 'BOARD_INVITE';
  message: string;
  read: boolean;
  data: {
    inviteId?: string;
    workspaceId?: string;
  };
}
