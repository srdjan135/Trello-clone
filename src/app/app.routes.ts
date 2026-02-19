import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { InviteComponent } from './workspaces/invite/invite.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'boards',
    pathMatch: 'full',
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./layout/layout.routes').then((m) => m.layoutRoutes),
  },
  {
    path: 'invite/:token',
    component: InviteComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'invite/:token/accept',
    component: InviteComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'switch-accounts',
    loadComponent: () =>
      import('./switch-accounts/switch-accounts.component').then(
        (m) => m.SwitchAccountsComponent,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./404-page/page-not-found.component').then(
        (m) => m.PageNotFoundComponent,
      ),
    canActivate: [AuthGuard],
  },
];
