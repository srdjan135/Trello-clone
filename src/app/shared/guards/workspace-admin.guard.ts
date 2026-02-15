import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { ApiService } from '../services/api.service';

export const WorkspaceAdminGuard: CanActivateFn = (route, status) => {
  const api = inject(ApiService);
  const router = inject(Router);

  const workspaceId = route.paramMap.get('workspaceId')!;

  return api.getMyRole(workspaceId).pipe(
    map((res) => {
      if (res.role === 'admin') {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }),
  );
};
