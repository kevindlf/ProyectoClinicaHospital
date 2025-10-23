// src/app/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { PacienteService } from '../pacientes/paciente'; // Corrección de import
import { AuthService } from '../auth/auth'; // Corrección de import
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Para @if/@for
import { MatButtonModule } from '@angular/material/button'; // Para el botón de logout

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  pacientes: any[] = [];
  errorMensaje: string | null = null;
  cargando = true; // Variable para mostrar indicador de carga

  constructor(
    private pacienteService: PacienteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.cargarPacientes(); // <<< COMENTA ESTA LÍNEA TEMPORALMENTE
    this.cargando = false; // <<< AÑADE ESTO para que no se quede "Cargando..."
    console.log('Dashboard ngOnInit ejecutado (sin cargar pacientes).'); // Log para confirmar
  }

  cargarPacientes(): void {
    this.cargando = true;
    this.errorMensaje = null;
    this.pacienteService.getPacientes().subscribe({
      next: (data) => {
        console.log('Pacientes recibidos:', data);
        this.pacientes = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener pacientes:', error);
        if (error.status === 401 || error.status === 403) {
          this.errorMensaje = 'No autorizado. Serás redirigido al login.';
          setTimeout(() => this.logout(), 2000);
        } else {
          this.errorMensaje = 'Error al cargar los datos de pacientes desde el servidor.';
        }
        this.cargando = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}