// src/app/material/material-module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones existentes
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

// --- NUEVAS IMPORTACIONES ---
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
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
    // --- NUEVOS EXPORTS ---
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule, // Exporta MatNativeDateModule
    MatRadioModule
    // --- FIN NUEVOS EXPORTS ---
  ]
})
export class MaterialModule { }