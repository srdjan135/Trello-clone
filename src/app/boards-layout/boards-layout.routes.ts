import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';

export const boardsLayoutRoutes: Routes = [
  {
    path: ':workspaceId/boards/:boardId',
    loadComponent: () =>
      import('../workspaces/workspace/boards/board/board.component').then(
        (m) => m.BoardComponent,
      ),
    canActivate: [AuthGuard],
  },
];
