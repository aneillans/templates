import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth/auth.guards';
import { marker } from './core/i18n/languages';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    // Everything under here requires a session and renders inside the main layout.
    // Put public pages (privacy, terms) above it.
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: marker('dashboard.title'),
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'admin',
        title: marker('admin.title'),
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin.component').then((m) => m.AdminComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
