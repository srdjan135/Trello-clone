import { Board } from './board.model';
import { User } from './user.model';

export interface Workspace {
  _id: string;
  name: string;
  members: User[];
  isPrivate: boolean;
  description?: string;
  boards?: Board[];
}
