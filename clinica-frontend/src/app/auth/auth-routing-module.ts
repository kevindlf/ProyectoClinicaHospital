// src/app/auth/auth-routing-module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Registro } from './registro/registro';

const routes: Routes = [
  {
    path: 'login', // Cuando la URL sea /auth/login
    component: Login
  },
  {
    path: 'registro', // Cuando la URL sea /auth/registro
    component: Registro
  },
  {
    // Redirección por defecto si entran a /auth solo
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }