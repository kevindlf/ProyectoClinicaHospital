// src/app/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
// Quitamos PacienteService ya que no se usa aquí directamente
import { AuthService } from '../auth/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card'; // Importamos MatCardModule
import { MatIconModule } from '@angular/material/icon'; // Importamos MatIconModule

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Añadimos MatCardModule y MatIconModule a los imports
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  // Propiedades para el mensaje de bienvenida dinámico
  rolUsuario: string | null = null;
  nombreUsuario: string | null = null;
  mensajeBienvenida: string = '';

  constructor(
    // Quitamos pacienteService
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener rol y nombre del usuario
    this.rolUsuario = this.authService.obtenerRolUsuario();
    this.nombreUsuario = this.authService.obtenerNombreUsuario();

    // Construir mensaje de bienvenida
    if (this.rolUsuario && this.nombreUsuario) {
      const rolCapitalizado = this.rolUsuario.charAt(0).toUpperCase() + this.rolUsuario.slice(1).toLowerCase();
      this.mensajeBienvenida = `${rolCapitalizado} ${this.nombreUsuario}`;
    } else {
      this.mensajeBienvenida = 'Usuario';
    }

    console.log(`Dashboard cargado para rol: ${this.rolUsuario}`);
  }

  // Método para verificar si el usuario puede crear/modificar pacientes
  puedeGestionarPacientes(): boolean {
    return this.rolUsuario === 'MEDICO' || this.rolUsuario === 'ADMIN';
  }

  // Método para verificar si el usuario es ADMIN
  esAdmin(): boolean {
    return this.rolUsuario === 'ADMIN';
  }

  // Quitamos el método cargarPacientes()

  // --- NUEVOS MÉTODOS PARA NAVEGACIÓN ---
  irACrearPaciente(): void {
    this.router.navigate(['/pacientes/nuevo']);
  }

  irAModificarPaciente(): void {
    this.router.navigate(['/pacientes/listar']);
  }

  irAObservarPaciente(): void {
    this.router.navigate(['/pacientes/observar']);
  }

  // --- MÉTODOS PARA GESTIÓN DE USUARIOS (SOLO ADMIN) ---
  irACrearUsuario(): void {
    this.router.navigate(['/admin/crear-usuario']);
  }

  irAGestionarUsuarios(): void {
    this.router.navigate(['/admin/gestionar-usuarios']);
  }
  // --- FIN MÉTODOS GESTIÓN USUARIOS ---


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
