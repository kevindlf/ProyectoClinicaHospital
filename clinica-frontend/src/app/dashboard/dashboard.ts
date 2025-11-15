// src/app/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
// Quitamos PacienteService ya que no se usa aquí directamente
import { AuthService } from '../auth/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card'; // Importamos MatCardModule
import { MatIconModule } from '@angular/material/icon'; // Importamos MatIconModule

/**
 * Componente principal del dashboard de la aplicación.
 * Muestra estadísticas generales del sistema, navegación rápida a módulos
 * principales (pacientes, usuarios, administración), indicadores de estado
 * y accesos directos basados en el rol del usuario. Incluye manejo de errores,
 * indicadores de carga y navegación responsive. Accesible para todos los usuarios autenticados.
 */
/**
 * Componente principal del dashboard de la aplicación.
 * Muestra estadísticas generales del sistema (número de pacientes,
 * usuarios activos, etc.), navegación rápida a módulos principales
 * (pacientes, usuarios, administración), y widgets informativos.
 * Incluye indicadores de carga, manejo de errores y controles de acceso
 * basados en roles de usuario. Compatible con SSR.
 */
/**
 * Componente principal del dashboard de la aplicación de la clínica.
 * Muestra un mensaje de bienvenida personalizado según el rol del usuario,
 * y proporciona botones de navegación para gestionar pacientes y usuarios
 * basados en permisos (ADMIN puede gestionar usuarios, MEDICO/ENFERMERO/TECNICO
 * pueden gestionar pacientes). Incluye funcionalidad de logout.
 */
/**
 * Componente principal del dashboard de la aplicación.
 * Muestra estadísticas generales del sistema, navegación rápida a módulos
 * principales (pacientes, usuarios, administración), indicadores de carga,
 * manejo de errores y funcionalidades específicas por rol de usuario.
 * Incluye gráficos, listas recientes y acceso directo a acciones comunes.
 * Accesible para usuarios autenticados según sus permisos.
 */
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
