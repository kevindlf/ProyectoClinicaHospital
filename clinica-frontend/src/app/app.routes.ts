// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: 'auth',
    // Asegúrate que el nombre del archivo sea exacto (sin .ts)
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    component: Dashboard
    // Más adelante añadiremos un 'Guard' aquí para protegerla
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];