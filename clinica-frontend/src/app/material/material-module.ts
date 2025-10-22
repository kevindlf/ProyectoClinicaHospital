// src/app/material/material.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. Aquí se IMPORTAN los módulos desde @angular/material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],

  // 2. Aquí es donde EXPORTAS la lista
  // Esto es lo que preguntabas:
  exports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,  // <-- Este era el que te daba el error
    MatButtonModule,
    MatIconModule
  ]
})
export class MaterialModule { }