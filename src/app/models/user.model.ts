import { Workspace } from './workspace';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  workspaces: Workspace[];
}
