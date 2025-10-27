// src/app/pacientes/pacientes-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PacienteFormComponent } from './paciente-form/paciente-form.component'; // Renombrado si cambiaste nombre de archivo
import { PacienteDetailComponent } from './paciente-detail/paciente-detail'; // Renombrado si cambiaste nombre de archivo

const routes: Routes = [
  {
    path: 'nuevo',
    component: PacienteFormComponent // Ruta para crear (solo datos personales)
  },
  {
    path: ':id/editar', // Ruta general para editar (la ajustaremos después)
    component: PacienteFormComponent
  },
  {
    path: ':id/detalle', // Ruta principal de la vista de detalle
    component: PacienteDetailComponent,
    // --- INICIO RUTAS HIJAS ---
    children: [
      {
        path: 'datos-personales', // Se activará con /pacientes/:id/detalle/datos-personales
        component: PacienteFormComponent // Reutilizamos el form para mostrar/editar esta sección
      },
      // --- Añadimos rutas hijas para las otras secciones ---
      {
        path: 'alergias', // -> /pacientes/:id/detalle/alergias
        component: PacienteFormComponent // Temporalmente apunta al mismo form
      },
      {
        path: 'antecedentes', // -> /pacientes/:id/detalle/antecedentes
        component: PacienteFormComponent // Temporalmente apunta al mismo form
      },
      {
        path: 'medicacion', // -> /pacientes/:id/detalle/medicacion
        component: PacienteFormComponent // Temporalmente apunta al mismo form
      },
      {
        path: 'historia', // -> /pacientes/:id/detalle/historia
        component: PacienteFormComponent // Temporalmente apunta al mismo form
      },
      {
        path: 'dialisis', // -> /pacientes/:id/detalle/dialisis
        component: PacienteFormComponent // Temporalmente apunta al mismo form
      },
      {
        path: 'evolucion', // -> /pacientes/:id/detalle/evolucion
        component: PacienteFormComponent // Temporalmente apunta al mismo form
      },
      // --- FIN RUTAS AÑADIDAS ---

      // Ruta hija por defecto: Cuando se navega a /pacientes/:id/detalle,
      // automáticamente redirige y carga 'datos-personales'.
      {
         path: '',
         redirectTo: 'datos-personales',
         pathMatch: 'full'
      }
    ]
    // --- FIN RUTAS HIJAS ---
  },
  {
    path: '', // Ruta base del módulo /pacientes
    redirectTo: 'nuevo', // Mantenemos la redirección a crear por defecto
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
// Asegúrate que el nombre de la clase sea PacientesRoutingModule (con 's')
export class PacientesRoutingModule { }