export interface WorkspaceMember {
  _id: string;
  role: 'admin' | 'member';
  workspaceId: string;
  user: {
    _id: string;
    username: string;
    email?: string;
  };
}
