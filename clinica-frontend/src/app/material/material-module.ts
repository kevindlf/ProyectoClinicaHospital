// src/app/material/material.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones existentes
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';

// --- NUEVAS IMPORTACIONES PARA SIDENAV ---
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
// --- FIN NUEVAS IMPORTACIONES ---

// --- NUEVAS IMPORTACIONES PARA TABLAS Y MENÚS ---
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
// --- FIN NUEVAS IMPORTACIONES ---


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
    // Existentes
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatDividerModule,
    // --- NUEVOS EXPORTS PARA SIDENAV ---
    MatSidenavModule,
    MatListModule,
    // --- FIN NUEVOS EXPORTS ---
    // --- NUEVOS EXPORTS PARA TABLAS Y MENÚS ---
    MatTableModule,
    MatMenuModule
    // --- FIN NUEVOS EXPORTS ---
  ]
})
export class MaterialModule { }
