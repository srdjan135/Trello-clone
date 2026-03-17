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
      {
        path: 'how-it-works',
        loadComponent: () =>
          import('../help/how-it-works/how-it-works.component').then(
            (m) => m.HowItWorksComponent,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'contact-support',
        loadComponent: () =>
          import('../help/contact-support/contact-support.component').then(
            (m) => m.ContactSupportComponent,
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../account-settings/account-settings.component').then(
            (m) => m.AccountSettingsComponent,
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];
