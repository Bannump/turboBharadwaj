import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./tasks/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
