// src/app/pacientes/pacientes-routing-module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PacienteFormComponent } from './paciente-form/paciente-form.component';
// Importaremos PacienteDetailComponent cuando lo creemos

const routes: Routes = [
  {
    path: 'nuevo',
    component: PacienteFormComponent
  },
  {
    path: 'editar/:id', // Ruta para editar datos personales (usa el mismo form)
    component: PacienteFormComponent
  },
  // --- NUEVA RUTA DE DETALLE ---
  {
    path: ':id/detalle', // Ruta /pacientes/<id>/detalle
    // component: PacienteDetailComponent // <<< Usaremos este componente después
    // Temporalmente, podemos redirigir o mostrar un placeholder
    component: PacienteFormComponent // <<< TEMPORAL: Reutiliza el form para ver si llega
    // O redirigir al dashboard: redirectTo: '/dashboard', pathMatch: 'full'
  },
  // --- FIN RUTA DETALLE ---
  {
    path: '',
    redirectTo: 'nuevo', // Por defecto, va a crear
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacientesRoutingModule { }