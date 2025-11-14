// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { GestionUsuariosComponent } from './admin/crear-usuarios/crear-usuarios';
import { AdminListComponent } from './admin/admin-list/admin-list';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    component: Dashboard
    // Próximamente: canActivate: [authGuard]
  },
  {
    path: 'admin/crear-usuario',
    component: GestionUsuariosComponent,
    // Próximamente: canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/gestionar-usuarios',
    component: AdminListComponent, // Usar el nuevo componente para listar usuarios
    // Próximamente: canActivate: [authGuard, adminGuard]
  },
  // --- NUEVA RUTA PARA PACIENTES ---
  {
    path: 'pacientes', // La ruta base para la sección de pacientes
    loadChildren: () => import('./pacientes/pacientes-module').then(m => m.PacientesModule)
    // Próximamente: canActivate: [authGuard] // Protegeremos esta sección también
  },

  {
    path: '',
    redirectTo: 'auth', // Sigue redirigiendo al login si no hay ruta específica
    pathMatch: 'full'
  }
];
