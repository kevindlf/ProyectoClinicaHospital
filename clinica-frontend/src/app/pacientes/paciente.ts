// src/app/pacientes/paciente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Podrías definir una interfaz aquí para el tipo Paciente
// interface Paciente { id: string; nombre: string; apellido: string; ... }

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private apiUrl = 'http://localhost:8080/api/pacientes'; // URL base para pacientes

  constructor(private http: HttpClient) { }

  // Método para obtener la lista de pacientes (ENDPOINT PROTEGIDO)
  getPacientes(): Observable<any[]> { // Reemplaza any[] con Paciente[] si defines la interfaz
    // El AuthInterceptor añadirá el token JWT automáticamente a esta petición GET
    return this.http.get<any[]>(this.apiUrl);
  }

}