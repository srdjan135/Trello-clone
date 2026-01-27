import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { LayoutComponent } from './layout.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'boards',
        loadComponent: () =>
          import('../workspaces/workspaces.component').then(
            (m) => m.WorkspacesComponent,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: ':workspaceId/boards',
        loadComponent: () =>
          import('../workspaces/workspace/workspace-boards/workspace-boards.component').then(
            (m) => m.WorkspaceBoardsComponent,
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];
