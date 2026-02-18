import { Workspace } from './workspace';
import { Notification } from './notification';

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  workspaces: Workspace[];
  notifications?: Notification[];
}
