// src/app/admin/gestion-usuarios/gestion-usuarios.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
// 1. Asegúrate que la ruta al servicio sea correcta y la interfaz
import { UsuarioService, NuevoUsuario } from '../usuario';
import { Router } from '@angular/router';

const rolesPermitidos = ['ADMIN', 'MEDICO', 'ENFERMERO', 'TECNICO'];

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  templateUrl: './crear-usuarios.html',
  styleUrls: ['./crear-usuarios.css'] // Corregido a styleUrls
})
// 2. Corregido el nombre de la clase a GestionUsuariosComponent
export class GestionUsuariosComponent implements OnInit {

  usuarioForm!: FormGroup;
  rolesDisponibles: string[] = rolesPermitidos;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  estaEnviando = false;

  // 3. Inyecta UsuarioService
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService, // Inyección
    private router: Router
   ) { }

  ngOnInit(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid || this.estaEnviando) {
      this.usuarioForm.markAllAsTouched();
      if (!this.estaEnviando) {
        this.mensajeError = 'Por favor, completa todos los campos requeridos.';
      }
      this.mensajeExito = null;
      return;
    }

    this.mensajeError = null;
    this.mensajeExito = null;
    this.estaEnviando = true;

    const nuevoUsuario: NuevoUsuario = this.usuarioForm.value;
    console.log('Enviando nuevo usuario al backend:', nuevoUsuario);

    // 4. Llama al servicio para crear el usuario (descomentado)
    this.usuarioService.crearUsuario(nuevoUsuario).subscribe({
      next: (respuesta) => {
        console.log('Usuario creado con éxito:', respuesta);
        this.mensajeExito = `Usuario ${nuevoUsuario.nombre} ${nuevoUsuario.apellido} creado con rol ${nuevoUsuario.rol}.`;
        this.usuarioForm.reset();
        // Resetea validadores
        Object.keys(this.usuarioForm.controls).forEach(key => {
            const control = this.usuarioForm.get(key);
            control?.setErrors(null) ;
            control?.markAsUntouched();
            control?.markAsPristine();
        });
        this.usuarioForm.updateValueAndValidity();
        this.estaEnviando = false;
      },
      error: (error) => {
        console.error('Error DETALLADO al crear usuario:', error);
        let errorMsg = 'Error al crear el usuario. ';
        if (error.status === 400 && error.error) {
           errorMsg += error.error.message || error.error;
        } else if (error.status === 401 || error.status === 403) {
           errorMsg += 'No tienes permisos para realizar esta acción.';
        } else {
           errorMsg += 'Inténtalo más tarde.';
        }
        this.mensajeError = errorMsg;
        this.estaEnviando = false;
      }
    });
    // Se elimina el código simulado que estaba después
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
