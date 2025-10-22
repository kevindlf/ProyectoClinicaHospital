// src/app/auth/auth-module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './login/login'; // Asegúrate que el path sea correcto
import { Registro } from './registro/registro'; // Asegúrate que el path sea correcto

import { MaterialModule } from '../material/material-module'; // Revisa el nombre del archivo si es necesario
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    Login,
    Registro
  ]
})
export class AuthModule { }