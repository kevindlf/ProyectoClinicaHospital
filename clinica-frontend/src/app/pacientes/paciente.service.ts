// src/app/pacientes/paciente.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- INTERFAZ PACIENTE (Revisar y ajustar tipos) ---
export interface Paciente {
  id?: string;
  qrCodeData?: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string | null;
  documento?: string;
  genero?: string;
  estadoCivil?: string;
  fechaPrimeraDialisis?: string | null;
  telefonos?: string[];
  emails?: string[];
  emailsPrioritarios?: string[]; // Emails prioritarios para envío de QR
  domicilio?: string;
  obraSocial?: string;
  institucion?: string;
  alergias?: Alergia[];
  testigoJehova?: boolean;
  seTransfunde?: boolean;
  antecedentesPersonales?: Antecedente[];
  medicacionActual?: Medicacion[];
  historiaClinica?: Historial[];
  parametrosDialisis?: { [key: string]: string };
  evolucionMensual?: Evolucion[];
}
export interface Alergia { descripcion: string; }
export interface Antecedente { nombre: string; detalle: string; }
export interface Medicacion { nombre: string; dosis: string; }
export interface Historial {
  fecha: string;
  profesional?: string;
  grupoSanguineo?: string;
  peso?: string;
  pesoSeco?: string;
  altura?: string;
  fechaPrimeraDialisisVida?: string;
  fechaPrimeraDialisisClinica?: string;
  heparina?: string;
  antecedentesEnfermedad?: string;
  medicacionPrescritaDialisis?: string;
  medicacionDomiciliaria?: string;
  detalle?: string;
}
export interface Evolucion { fecha: string; profesional: string; informeGeneral: string; }
// --- FIN INTERFACES ---

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private apiUrl = 'http://localhost:8080/api/pacientes';

  constructor(private http: HttpClient) { }

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  getPacientePorId(id: string): Observable<Paciente> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Paciente>(url);
  }

  // Método para crear (envía los datos personales iniciales)
  crearPaciente(datosPersonales: any): Observable<Paciente> { // Usamos 'any' temporalmente para los datos personales
    // Creamos un objeto Paciente 'base' solo con los datos personales
    const pacienteData: Partial<Paciente> = { ...datosPersonales };
    return this.http.post<Paciente>(this.apiUrl, pacienteData);
  }

  // Método para actualizar (podría recibir el paciente completo o parcial)
  actualizarPaciente(id: string, pacienteData: Partial<Paciente>): Observable<Paciente> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Paciente>(url, pacienteData);
  }

  eliminarPaciente(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
