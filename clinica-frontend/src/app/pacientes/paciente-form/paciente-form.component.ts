// src/app/pacientes/paciente-form/paciente-form.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Importa RouterLink
// 1. Importa PacienteService, Paciente Y Observable
import { PacienteService, Paciente } from '../paciente.service'; // Asegúrate que el path y nombre sean correctos
import { Observable } from 'rxjs'; // <<< IMPORTAR Observable
// 2. Importa HttpErrorResponse (opcional pero bueno para tipar errores)
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterLink // <<< AÑADE RouterLink aquí
  ],
  templateUrl: './paciente-form.component.html',
  styleUrls: ['./paciente-form.component.css']
})
export class PacienteFormComponent implements OnInit {

  datosPersonalesForm!: FormGroup;
  pacienteId: string | null = null;
  isLoading = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.paramMap.get('id');
    console.log('ID Paciente (desde URL):', this.pacienteId);

    this.datosPersonalesForm = this.fb.group({
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        fechaNacimiento: [null, Validators.required],
        documento: ['', Validators.required],
        genero: ['', Validators.required],
        estadoCivil: [''],
        fechaPrimeraDialisis: [null],
        telefonos: [''],
        emails: ['', Validators.email],
        domicilio: [''],
        obraSocial: [''],
        institucion: ['']
    });

    if (this.pacienteId) {
      console.log('Modo Edición - Cargando datos...');
      this.cargarDatosPaciente(this.pacienteId);
    } else {
      console.log('Modo Creación - Formulario Datos Personales.');
    }
  }

  cargarDatosPaciente(id: string): void {
    this.isLoading = true;
    this.mensajeError = null;
    this.pacienteService.getPacientePorId(id).subscribe({
      next: (paciente: Paciente) => { // <<< Tipado explícito
        console.log('Datos recibidos para edición:', paciente);
        this.datosPersonalesForm.patchValue(paciente);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse | any) => { // <<< Tipado explícito
        console.error('Error al cargar datos del paciente:', err);
        this.mensajeError = 'No se pudieron cargar los datos del paciente.';
        this.isLoading = false;
      }
    });
  }
// --- onSubmit MODIFICADO ---
  onSubmit(): void {
    if (this.datosPersonalesForm.invalid || this.isLoading) {
      this.markAllAsTouched(this.datosPersonalesForm);
      if (!this.isLoading) {
          this.mensajeError = 'Por favor, completa los campos requeridos.';
      }
      this.mensajeExito = null;
      return;
    }

    this.mensajeError = null;
    this.mensajeExito = null;
    this.isLoading = true;

    // --- INICIO CAMBIO: Convertir strings a arrays ---
    const formValues = this.datosPersonalesForm.value;
    const datosParaEnviar: Partial<Paciente> = {
      ...formValues, // Copia todos los valores del formulario
      // Convierte 'telefonos' de string a array (separado por comas, quita espacios)
      telefonos: formValues.telefonos ? formValues.telefonos.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      // Convierte 'emails' de string a array (separado por comas, quita espacios)
      emails: formValues.emails ? formValues.emails.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []
      // Considera formatear fechas aquí también si es necesario...
      // fechaNacimiento: formValues.fechaNacimiento ? new Date(formValues.fechaNacimiento).toISOString().split('T')[0] : null,
      // fechaPrimeraDialisis: formValues.fechaPrimeraDialisis ? new Date(formValues.fechaPrimeraDialisis).toISOString().split('T')[0] : null
    };
    // --- FIN CAMBIO ---


    let guardarObservable: Observable<Paciente>;

    if (!this.pacienteId) {
      // --- CREACIÓN ---
      console.log('Enviando datos para crear paciente:', datosParaEnviar); // Usa los datos convertidos
      guardarObservable = this.pacienteService.crearPaciente(datosParaEnviar); // Usa los datos convertidos
    } else {
      // --- ACTUALIZACIÓN ---
      console.log(`Enviando actualización para paciente ${this.pacienteId}:`, datosParaEnviar); // Usa los datos convertidos
      guardarObservable = this.pacienteService.actualizarPaciente(this.pacienteId, datosParaEnviar); // Usa los datos convertidos
    }

    guardarObservable.subscribe({
      next: (pacienteGuardado: Paciente) => {
        console.log('Datos guardados con éxito:', pacienteGuardado);
        this.isLoading = false;
        const id = pacienteGuardado.id;

        if (!id) {
            console.error("El backend no devolvió un ID.");
            this.mensajeError = "Error al procesar la respuesta.";
            return;
        }

        if (!this.pacienteId) {
            this.pacienteId = id;
        }
        this.mensajeExito = "Datos personales guardados correctamente.";

        setTimeout(() => {
            this.router.navigate(['/pacientes', id, 'detalle']);
        }, 1500);

      },
      error: (err: HttpErrorResponse | any) => {
        console.error('Error DETALLADO al guardar:', err); // Logueamos el error detallado
        const status = (err instanceof HttpErrorResponse) ? err.status : null;
        this.mensajeError = `Error al guardar: ${err?.error?.message || err?.message || 'Error desconocido'} (Status: ${status ?? 'N/A'})`;
        this.isLoading = false;
      }
    });
  }
  // --- FIN onSubmit ---

  markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      } else {
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}