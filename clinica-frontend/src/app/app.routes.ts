// src/app/app-routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [

  // Carga Diferida (Lazy Loading) para Autenticación
  {
    path: 'auth', // Todo lo que empiece con /auth
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },

  // Ruta por defecto de la aplicación
  {
    path: '',
    redirectTo: 'auth', // Redirige a /auth (que a su vez redirige a /login)
    pathMatch: 'full'
  }
];