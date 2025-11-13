// src/app/pacientes/paciente-detail/paciente-detail.ts

import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
// Importamos RouterLink y RouterOutlet
import { ActivatedRoute, Router, RouterOutlet, RouterLink } from '@angular/router'; // <<< Ya están aquí
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { PacienteService, Paciente } from '../paciente.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  // Aseguramos que estén en imports
  imports: [CommonModule, MaterialModule, RouterOutlet, RouterLink], // <<< Ya están aquí
  templateUrl: './paciente-detail.html',
  styleUrls: ['./paciente-detail.css']
})
export class PacienteDetailComponent implements OnInit {

  paciente$: Observable<Paciente | null> | undefined;
  errorCarga: string | null = null;
  pacienteId: string | null = null;
  objectKeys = Object.keys; // Mantenemos para 'Parámetros Diálisis'
  window: any = window; // Declaramos window para acceder en el template

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    // La lógica de carga se mantiene igual
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    if (this.pacienteId) {
      console.log('Cargando detalles para paciente ID:', this.pacienteId);
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

  // Este método ya no es necesario aquí, lo quitaré
  // editarSeccion(seccion: string): void { ... }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

isMobile: boolean = window.innerWidth < 1024;
  @HostListener('window:resize')
onResize() {
  this.isMobile = window.innerWidth < 1024;
}

  @ViewChild('sidenav') sidenav!: MatSidenav;

  abrirSidenav() {
    this.sidenav.open();
  }

  cerrarSidenav() {
    this.sidenav.close();
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }
}