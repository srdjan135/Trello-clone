import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, tap } from 'rxjs';
import { Workspace } from '../../models/workspace';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private workspaces$ = new BehaviorSubject<Workspace[]>([]);
  workspaces = this.workspaces$.asObservable();

  private workspaceMembersRemainingNumber$ = new Subject<number>();
  workspaceMembersRemainingNumber =
    this.workspaceMembersRemainingNumber$.asObservable();

  private workspaceId$ = new BehaviorSubject<string | null>(null);
  workspaceId = this.workspaceId$.asObservable();

  constructor(private api: ApiService) {}

  getWorkspaces() {
    return this.api
      .getWorkspaces()
      .pipe(tap((res) => this.workspaces$.next(res.workspaces)));
  }

  updateWorkspacesList(workspace: Workspace) {
    this.workspaces$.next([...this.workspaces$.value, workspace]);
  }

  setWorkspaceId(id: string) {
    this.workspaceId$.next(id);
  }
}
