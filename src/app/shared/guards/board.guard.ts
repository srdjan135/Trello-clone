import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

export const BoardGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const api = inject(ApiService);
  const router = inject(Router);

  const boardId = route.paramMap.get('boardId');

  if (!boardId) {
    router.navigate(['/']);
    return of(false);
  }

  return api.getBoard(boardId).pipe(
    map(() => true),
    catchError((err) => {
      if (err.status === 403) {
        router.navigate(['/not-found']);
      } else {
        router.navigate(['/']);
      }
      return of(false);
    }),
  );
};
