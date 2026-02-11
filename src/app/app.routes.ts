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
  },
  {
    path: 'invite/:token/accept',
    component: InviteComponent,
    canActivate: [AuthGuard],
  },
];
