import { User } from './user.model';
import { Workspace } from './workspace';

export interface Board {
  _id: string;
  title: string;
  background: string;
  members: User[];
  workspace: Workspace | string;
  visibility: 'private' | 'workspace' | 'public';
  addedViaWorkspace: boolean;
  description?: string;
}
