import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, status) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.getIsAuth();

  if (!isAuth) {
    return router.parseUrl('signin');
  }

  return true;
};
