import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Workspace } from '../../models/workspace';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private workspaces$ = new BehaviorSubject<Workspace[]>([]);
  workspaces = this.workspaces$.asObservable();

  constructor(private api: ApiService) {}

  getWorkspaces() {
    return this.api
      .getWorkspaces()
      .pipe(tap((res) => this.workspaces$.next(res.workspaces)));
  }

  updateWorkspacesList(workspace: Workspace) {
    this.workspaces$.next([...this.workspaces$.value, workspace]);
  }
}
