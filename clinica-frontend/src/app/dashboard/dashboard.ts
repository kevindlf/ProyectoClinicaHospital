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

  // Quitamos las propiedades pacientes, errorMensaje, cargando

  constructor(
    // Quitamos pacienteService
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // El ngOnInit ahora está vacío, podríamos poner lógica de bienvenida si quisiéramos
    console.log('Dashboard del Médico cargado.');
  }

  // Quitamos el método cargarPacientes()

  // --- NUEVOS MÉTODOS PARA NAVEGACIÓN ---
  irACrearPaciente(): void {
    this.router.navigate(['/pacientes/nuevo']);
  }

  irAModificarPaciente(): void {
    // Navegaremos a una futura ruta para listar/buscar pacientes
    console.log('Navegando a Modificar Paciente (ruta pendiente)...');
    // this.router.navigate(['/pacientes/lista']); // Ejemplo de ruta futura
    alert('Funcionalidad "Modificar Paciente" pendiente.'); // Placeholder
  }

  irAObservarPaciente(): void {
    // Navegaremos a la misma futura ruta para listar/buscar pacientes
    console.log('Navegando a Observar Paciente (ruta pendiente)...');
    // this.router.navigate(['/pacientes/lista']); // Ejemplo de ruta futura
    alert('Funcionalidad "Observar Paciente" pendiente.'); // Placeholder
  }
  // --- FIN NUEVOS MÉTODOS ---


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}