import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { WorkspaceAdminGuard } from '../shared/guards/workspace-admin.guard';

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
      {
        path: ':workspaceId/members',
        loadComponent: () =>
          import('../workspaces/workspace/members/members.component').then(
            (m) => m.MembersComponent,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: ':workspaceId/settings',
        loadComponent: () =>
          import('../workspaces/workspace/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
        canActivate: [AuthGuard, WorkspaceAdminGuard],
      },
      {
        path: 'manage-account',
        loadComponent: () =>
          import('../manage-account/manage-account.component').then(
            (m) => m.ManageAccountComponent,
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];
