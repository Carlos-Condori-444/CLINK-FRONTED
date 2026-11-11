import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/auth/registro/registro.component')
        .then(m => m.RegistroComponent)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    children: [
      { path: '', pathMatch: 'full', data: { vista: 'resumen' }, loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'enlaces', data: { vista: 'enlaces' }, loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'estadisticas', data: { vista: 'estadisticas' }, loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'qr', data: { vista: 'qr' }, loadComponent: () => import('./features/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
