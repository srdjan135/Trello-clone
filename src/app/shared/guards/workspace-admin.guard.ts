import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { catchError, EMPTY, map, of, switchMap, take } from 'rxjs';
import { ApiService } from '../services/api.service';
import { WorkspaceService } from '../services/workspace.service';

export const WorkspaceAdminGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  const workspaceService = inject(WorkspaceService);

  return workspaceService.workspaceId.pipe(
    take(1),
    switchMap((workspaceId) => {
      if (!workspaceId) {
        router.navigate(['/']);
        return EMPTY;
      }

      return api.getMyRole(workspaceId);
    }),
    map((res) => {
      if (res.role === 'admin') {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    }),
  );
};
