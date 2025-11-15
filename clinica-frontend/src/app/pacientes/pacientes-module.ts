import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PacientesRoutingModule } from './pacientes-routing-module';

/**
 * Módulo principal para la gestión de pacientes.
 * Agrupa todos los componentes, servicios y rutas relacionadas con pacientes,
 * incluyendo formularios, listas, detalles y observación de pacientes.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PacientesRoutingModule
  ]
})
export class PacientesModule { }
