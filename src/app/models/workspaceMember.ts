import { Board } from './board.model';

export interface WorkspaceMember {
  _id: string;
  role: 'admin' | 'member';
  workspaceId: string;
  previousBoards: Board[];
  user: {
    _id: string;
    username: string;
    email?: string;
  };
}
