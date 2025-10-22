// src/app/auth/login/login.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit { // Implementa OnInit

  loginForm!: FormGroup; // Declara el FormGroup

  constructor(private fb: FormBuilder) { } // Inyecta FormBuilder

  ngOnInit(): void {
    // Crea el formulario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Función para manejar el submit
  onLogin(): void {
    if (this.loginForm.invalid) {
      console.log('Formulario inválido');
      // Aquí podrías añadir lógica para marcar los campos como "touched" y mostrar errores
      this.loginForm.markAllAsTouched();
      return;
    }
    console.log('Datos del formulario:', this.loginForm.value);
    // Aquí iría la llamada al servicio de autenticación
  }
}