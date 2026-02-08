import { Workspace } from './workspace';

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  workspaces: Workspace[];
  notifications?: Notification[];
}
