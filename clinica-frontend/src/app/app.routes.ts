// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    // Asegúrate que el nombre del archivo sea exacto (sin .ts)
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  // ... resto de rutas
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  }
];