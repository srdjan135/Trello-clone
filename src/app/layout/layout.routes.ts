import { Routes } from '@angular/router';

export const layoutRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../workspaces/workspaces.component').then(
        (m) => m.WorkspacesComponent,
      ),
  },
];
