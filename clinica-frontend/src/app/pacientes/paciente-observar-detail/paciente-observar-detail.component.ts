import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { PacienteService, Paciente } from '../paciente.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-paciente-observar-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './paciente-observar-detail.component.html',
  styleUrls: ['./paciente-observar-detail.component.css']
})
export class PacienteObservarDetailComponent implements OnInit {

  paciente$: Observable<Paciente | null> | undefined;
  errorCarga: string | null = null;
  pacienteId: string | null = null;
  seccionActiva: string = 'datos-personales';
  objectKeys = Object.keys; // Para usar Object.keys en el template

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    this.seccionActiva = this.route.snapshot.paramMap.get('seccion') || 'datos-personales';

    if (this.pacienteId) {
      console.log('Cargando detalles para observación del paciente ID:', this.pacienteId);
      this.paciente$ = this.pacienteService.getPacientePorId(this.pacienteId).pipe(
        catchError(error => {
          console.error('Error al cargar paciente:', error);
          this.errorCarga = 'No se pudo cargar la información del paciente.';
          return of(null);
        })
      );
    } else {
      console.error('No se proporcionó ID de paciente.');
      this.errorCarga = 'No se especificó un paciente.';
    }
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    // Actualizar la URL sin recargar la página
    this.router.navigate(['/pacientes', this.pacienteId, 'observar', seccion]);
  }

  volver(): void {
    this.router.navigate(['/pacientes/observar']);
  }

  descargarQr(): void {
    if (this.pacienteId) {
      const link = document.createElement('a');
      link.href = `http://localhost:8080/api/qr/${this.pacienteId}`;
      link.download = `qr-paciente-${this.pacienteId}.png`;
      link.click();
    }
  }
}
