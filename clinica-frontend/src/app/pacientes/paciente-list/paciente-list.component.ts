import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { PacienteService, Paciente } from '../paciente.service';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './paciente-list.component.html',
  styleUrls: ['./paciente-list.component.css']
})
export class PacienteListComponent implements OnInit {

  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // Control para el buscador
  searchControl = new FormControl('');

  // Columnas a mostrar en la tabla
  displayedColumns: string[] = ['documento', 'nombre', 'apellido', 'fechaNacimiento', 'acciones'];

  constructor(
    private pacienteService: PacienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPacientes();

    // Configurar búsqueda reactiva
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Esperar 300ms después de que el usuario deje de escribir
        distinctUntilChanged() // Solo emitir si el valor cambió
      )
      .subscribe(searchTerm => {
        this.filtrarPacientes(searchTerm || '');
      });
  }

  cargarPacientes(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.pacienteService.getPacientes().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
        this.pacientesFiltrados = [...pacientes]; // Copia inicial
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.errorMessage = 'Error al cargar la lista de pacientes.';
        this.isLoading = false;
      }
    });
  }

  filtrarPacientes(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.pacientesFiltrados = [...this.pacientes];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.pacientesFiltrados = this.pacientes.filter(paciente =>
      paciente.documento?.toLowerCase().includes(term) ||
      paciente.nombre?.toLowerCase().includes(term) ||
      paciente.apellido?.toLowerCase().includes(term)
    );
  }

  editarPaciente(paciente: Paciente): void {
    if (paciente.id) {
      // Navegar al detalle del paciente en modo edición
      this.router.navigate(['/pacientes', paciente.id, 'detalle', 'datos-personales']);
    }
  }

  eliminarPaciente(paciente: Paciente): void {
    if (paciente.id && confirm(`¿Está seguro de eliminar al paciente ${paciente.nombre} ${paciente.apellido}?`)) {
      this.isLoading = true; // Mostrar loading durante la eliminación
      this.pacienteService.eliminarPaciente(paciente.id).subscribe({
        next: () => {
          // Actualizar las listas directamente sin recargar desde el servidor
          this.pacientes = this.pacientes.filter(p => p.id !== paciente.id);
          this.filtrarPacientes(this.searchControl.value || '');
          this.isLoading = false;
          this.errorMessage = null;
        },
        error: (error) => {
          console.error('Error al eliminar paciente:', error);
          this.errorMessage = 'Error al eliminar el paciente.';
          this.isLoading = false;
        }
      });
    }
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
